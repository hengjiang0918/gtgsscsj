<template>

    <div class="form-container">
        <div v-if="loading" class="mask-overlay"></div>
        <div class="form-card login-card">
            <div class="card-header">
                <div class="logo-section">
                    <div class="logo-icon">
                        <el-icon style="font-size: 32px; color: white;">
                            <UserFilled />
                        </el-icon>
                    </div>
                    <h1 class="app-title">系统登录</h1>
                    <p class="app-subtitle">欢迎使用管理系统</p>
                </div>
            </div>

            <div class="form-content">
                <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" class="login-form">
                    <div class="form-group">
                        <label class="form-label">用户名</label>
                        <div class="input-wrapper">
                            <el-icon class="input-icon">
                                <UserFilled />
                            </el-icon>
                            <el-input v-model="loginForm.username" placeholder="请输入用户名" class="form-input"
                                @focus="onInputFocus" @blur="onInputBlur" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">密码</label>
                        <div class="input-wrapper">
                            <el-icon class="input-icon">
                                <Lock />
                            </el-icon>
                            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"
                                class="form-input" show-password @focus="onInputFocus" @blur="onInputBlur" />
                        </div>
                    </div>

                    <div class="form-actions">
                        <el-button type="primary" class="submit-btn" @click="handleLogin" :loading="loading"
                            size="large">
                            {{ loading ? '登录中...' : '登录' }}
                        </el-button>
                    </div>
                </el-form>

                <!-- <div class="form-footer">
                    <a href="#" @click.prevent="handleForgotPassword" class="footer-link">忘记密码？</a>
                    <div class="register-button" @click="showRegisterForm">
                        <span class="register-text">注册账号</span>
                        <el-icon class="register-icon">
                            <ArrowRight />
                        </el-icon>
                    </div>
                </div> -->
            </div>
        </div>
    </div>
    <!-- 注册表单 -->

</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import api from '@/api'
import { useUserStore } from '@/stores/userStore';
const router = useRouter();
const userStore = useUserStore();
// 显示控制
const loading = ref(false);
const loginFormRef = ref(null);
// 登录表单
const loginForm = ref({
    username: 'nzh123',
    password: 'nzh123',
});

const loginRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' },
    ],
};
// 输入框交互处理
const onInputFocus = (event) => {
    const wrapper = event.target.closest('.input-wrapper');
    if (wrapper) {
        wrapper.classList.add('focused');
    }
};

const onInputBlur = (event) => {
    const wrapper = event.target.closest('.input-wrapper');
    if (wrapper) {
        wrapper.classList.remove('focused');
    }
};

// 登录相关方法
const handleLogin = () => {
    loginFormRef.value.validate((valid) => {
        if (valid) {
            loading.value = true;
            loginUser()
        } else {
            ElMessage.error('请检查输入内容');
        }
    });
};
const loginUser = () => {
    // 调用本地后端接口
    api.login({
        username: loginForm.value.username,
        password: loginForm.value.password,
    },)
        .then(data => {
            loading.value = false;
            ElMessage.success('登录成功！');
            userStore.newUser(data.user_id)
            api.userinfo({
                user_id: data.user_id
            })
                .then(data => {
                    userStore.newUserDetail(data.user)
                    userStore.newName(data.user.name)
                    userStore.newRole(data.user.role)

                    console.log('用户详情:', data.user.role)
                    // 根据用户角色重定向到不同页面
                    if (data.user.role == '3') {
                        router.replace({ path: '/indexManager' });

                    } else {
                        router.replace({ path: '/indexUser' });
                    }
                    userStore.newPage(data.user.role)
                })
            router.replace({ path: '/index' });

            // 这里写你的业务处理逻辑
        })
        .catch(err => {
            loading.value = false;
            // 错误已自动弹窗，这里可选写自定义处理
        })

}
const handleForgotPassword = () => {
    ElMessage.info('忘记密码功能尚未实现');
};
// 页面切换方法

const showRegisterForm = () => {
    router.push({ name: 'register' });
};
</script>

<style scoped lang="scss">
.form-container {
    max-height: 100vh;
    background: linear-gradient(135deg, #eaf4fb 0%, #d6e6f7 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    border-radius: 24px;

    // 背景点缀气泡
    .bg-decor {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;

        .bubble {
            position: absolute;
            border-radius: 50%;
            opacity: 0.45;
            filter: blur(2px);
            animation: float 8s ease-in-out infinite alternate;
        }

        .bubble1 {
            width: 180px;
            height: 180px;
            left: 5%;
            top: 12%;
            background: radial-gradient(circle at 30% 30%, #b3e0ff 0%, #d6e6f7 100%);
            animation-delay: 0s;
        }

        .bubble2 {
            width: 120px;
            height: 120px;
            right: 8%;
            top: 25%;
            background: radial-gradient(circle at 70% 30%, #a3c8f7 0%, #eaf4fb 100%);
            animation-delay: 2s;
        }

        .bubble3 {
            width: 90px;
            height: 90px;
            left: 18%;
            bottom: 10%;
            background: radial-gradient(circle at 60% 60%, #b3e0ff 0%, #eaf4fb 100%);
            animation-delay: 4s;
        }

        .bubble4 {
            width: 140px;
            height: 140px;
            right: 12%;
            bottom: 8%;
            background: radial-gradient(circle at 40% 70%, #d6e6f7 0%, #b3e0ff 100%);
            animation-delay: 1.5s;
        }
    }
}

@keyframes float {
    0% {
        transform: translateY(0) scale(1);
    }

    100% {
        transform: translateY(-18px) scale(1.07);
    }
}

.form-card {
    background: rgba(235, 245, 255, 0.98);
    border-radius: 24px;
    box-shadow: 0 8px 32px 0 rgba(120, 170, 255, 0.13);
    border: 1.5px solid #c7e0fa;
    max-width: 420px;
    width: 100%;
    overflow: hidden;
    position: relative;
    backdrop-filter: blur(10px);
    z-index: 1;
}

.card-header {
    padding: 38px 38px 22px;
    background: linear-gradient(120deg, #d6e6f7 0%, #eaf4fb 100%);
    color: #2251a8;
    text-align: center;
    position: relative;

    .logo-section {
        display: flex;
        flex-direction: column;
        align-items: center;

        .logo-icon {
            width: 62px;
            height: 62px;
            background: rgba(120, 170, 255, 0.13);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 18px;
            border: 2px solid #c7e0fa;
            box-shadow: 0 8px 24px rgba(120, 170, 255, 0.10);

            svg {
                width: 32px;
                height: 32px;
                color: #409eff;
            }
        }

        .app-title {
            font-size: 27px;
            font-weight: 700;
            margin: 0 0 8px 0;
            color: #2251a8;
            letter-spacing: 1px;
        }

        .app-subtitle {
            font-size: 15px;
            color: #5a7bbd;
            margin: 0;
        }
    }
}

.form-content {

    padding: 38px 38px 18px 38px;
    background: rgba(235, 245, 255, 0.98);

    .form-group {
        margin-bottom: 18px;

        .form-label {
            display: block;
            font-size: 15px;
            font-weight: 500;
            color: #5a7bbd;
            margin-bottom: 10px;
        }

        .input-wrapper {
            width: 350px;
            position: relative;
            border: 1.5px solid #c7e0fa;
            border-radius: 12px;
            background: #eaf4fb;
            transition: all 0.3s;
            display: flex;

            .input-icon {
                position: absolute;
                left: 14px;
                top: 50%;
                transform: translateY(-50%);
                color: #409eff;
                font-size: 19px;
                z-index: 2;
                pointer-events: none;
            }

            .form-input :deep(.el-input__inner) {
                padding-left: 38px;
                background: transparent;
                color: #2251a8;
            }

            &:hover,
            &.focused {
                border-color: #409eff;
                background: #d6e6f7;
                box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.10);
            }

            .form-input {
                :deep(.el-input__inner) {
                    height: 46px;
                    border: none;
                    border-radius: 0;
                    font-size: 15px;
                    background: transparent;
                    color: #2251a8;
                    box-shadow: none;
                }

                :deep(.el-input__inner):focus,
                :deep(.el-input__inner):hover {
                    border: none;
                    background: transparent;
                    box-shadow: none;
                }
            }
        }
    }

    .form-actions {
        margin-top: 32px;

        .submit-btn {
            width: 100%;
            height: 48px;
            font-size: 17px;
            font-weight: 600;
            border-radius: 14px;
            background: linear-gradient(90deg, #5bb6ff 0%, #409eff 100%);
            border: none;
            color: #fff;
            letter-spacing: 1px;
            box-shadow: 0 6px 18px rgba(64, 158, 255, 0.10);
            transition: all 0.25s;

            &:hover {
                background: linear-gradient(90deg, #409eff 0%, #5bb6ff 100%);
                transform: translateY(-2px);
                // box-shadow: 0 12px 32px rgba(64, 158, 255, 0.13);
            }
        }
    }

    .form-footer {
        margin-top: 28px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .register-button {
            display: flex;
            align-items: center;
            cursor: pointer;
            width: 120px;
            background: linear-gradient(120deg, rgba(120, 170, 255, 0.13) 0%, rgba(64, 158, 255, 0.10) 100%);
            border: 1.5px solid #409eff;
            border-radius: 30px;
            padding: 8px 0px 8px 16px;
            color: #5a7bbd;
            font-size: 15px;
            font-weight: 600;
            transition: all 0.25s cubic-bezier(.4, 1, .7, 1.2);
            box-shadow: 0 3px 12px rgba(64, 158, 255, 0.10);
            margin-left: 10px;
            letter-spacing: 0.5px;
            position: relative;
            overflow: hidden;

            &:hover {
                background: linear-gradient(120deg, #409eff 0%, #5bb6ff 100%);
                color: #fff;
                border-color: #fff;
                box-shadow: 0 6px 20px rgba(64, 158, 255, 0.13);
                transform: translateY(-2px) scale(1.045);
            }

            .register-icon {
                font-size: 19px;
                margin-right: 8px;
                transition: transform 0.3s cubic-bezier(.4, 1, .7, 1.2);
                color: #409eff;
            }

            .register-text {
                white-space: nowrap;
                z-index: 1;
                position: relative;
            }

            &:hover .register-icon {
                transform: translateX(4px) scale(1.08);
                color: #fff;
            }
        }

        .footer-link {
            color: #5a7bbd;
            text-decoration: none;
            font-size: 14px;
            transition: color 0.3s;

            &:hover {
                color: #409eff;
            }
        }
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .form-container {
        .form-card {
            width: 100%;
            max-width: 100%;

            .form-content {
                padding: 22px;
            }

            .card-header {
                padding: 22px 22px 18px;
            }

            .form-footer {
                flex-direction: column;
                gap: 14px;
            }
        }
    }
}
</style>