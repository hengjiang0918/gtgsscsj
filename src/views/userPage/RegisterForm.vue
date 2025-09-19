<template>
    <!-- 注册表单 -->
    <div class="form-container">
        <div v-if="loading" class="mask-overlay"></div>
        <div class="form-card register-card">
            <div class="card-header compact-header">
                <div class="logo-section">
                    <div class="logo-icon register-logo compact-logo">
                        <el-icon style="font-size: 24px; color: white;">
                            <Plus />
                        </el-icon>
                    </div>
                    <h1 class="app-title compact-title">用户注册</h1>
                    <p class="app-subtitle">创建您的新账户</p>
                </div>
            </div>
            <div class="form-content compact-content">
                <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" class="register-form">
                    <!-- 第一行：用户名和密码 -->
                    <div class="form-row form-row-double">
                        <div class="form-group half-width">
                            <label class="form-label compact-label">用户名</label>

                            <el-form-item prop="username">
                                <div class="input-wrapper compact-input">
                                    <el-icon class="input-icon">
                                        <UserFilled />
                                    </el-icon>
                                    <el-input v-model="registerForm.username" placeholder="请输入用户名" class="form-input"
                                        @focus="onInputFocus" @blur="onInputBlur" />
                                </div>
                            </el-form-item>
                        </div>

                        <div class="form-group half-width">
                            <label class="form-label compact-label">密码</label>

                            <el-form-item prop="password">
                                <div class="input-wrapper compact-input">
                                    <el-icon class="input-icon">
                                        <Lock />
                                    </el-icon>
                                    <el-input v-model="registerForm.password" type="password" placeholder="请输入密码"
                                        class="form-input" show-password @focus="onInputFocus" @blur="onInputBlur" />
                                </div>
                            </el-form-item>
                        </div>
                    </div>

                    <!-- 第二行：确认密码和部门 -->
                    <div class="form-row form-row-double">
                        <div class="form-group half-width">
                            <label class="form-label compact-label">确认密码</label>

                            <el-form-item prop="confirmPassword">
                                <div class="input-wrapper compact-input">
                                    <el-icon class="input-icon">
                                        <Lock />
                                    </el-icon>
                                    <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入"
                                        style="height: 100%;" class="form-input" show-password @focus="onInputFocus"
                                        @blur="onInputBlur" />
                                </div>
                            </el-form-item>
                        </div>
                        <div class="form-group half-width">
                            <label class="form-label compact-label">姓名</label>

                            <el-form-item prop="name">
                                <div class="input-wrapper compact-input">
                                    <el-icon class="input-icon">
                                        <OfficeBuilding />
                                    </el-icon>
                                    <el-input v-model="registerForm.name" placeholder="请输入姓名" class="form-input"
                                        @focus="onInputFocus" @blur="onInputBlur" />
                                </div>
                            </el-form-item>

                        </div>
                    </div>

                    <!-- 第三行：职位和手机号 -->
                    <div class="form-row form-row-double">
                        <div class="form-group half-width">
                            <label class="form-label compact-label">分公司</label>

                            <el-form-item prop="filiale">
                                <div class="input-wrapper compact-input">
                                    <el-icon class="input-icon">
                                        <User />
                                    </el-icon>
                                    <el-select v-model="registerForm.filiale" class="form-input" placeholder="请选择分公司">
                                        <el-option label="服一分公司" value="1"></el-option>
                                        <el-option label="服三分公司" value="3"></el-option>
                                        <el-option label="服五分公司" value="5"></el-option>
                                        <el-option label="服六分公司" value="6"></el-option>
                                        <el-option label="服七分公司" value="7"></el-option>
                                        <el-option label="服八分公司" value="8"></el-option>
                                        <el-option label="服九分公司" value="9"></el-option>
                                        <el-option label="服十二分公司" value="12"></el-option>
                                        <el-option label="服十五分公司" value="15"></el-option>
                                        <el-option label="服十六分公司" value="16"></el-option>
                                        <el-option label="服十七分公司" value="17"></el-option>
                                        <el-option label="服十九分公司" value="19"></el-option>
                                    </el-select>
                                </div>
                            </el-form-item>
                        </div>
                        <div class="form-group half-width">
                            <label class="form-label compact-label">部门</label>

                            <el-form-item prop="department">
                                <div class="input-wrapper compact-input">
                                    <el-icon class="input-icon">
                                        <OfficeBuilding />
                                    </el-icon>
                                    <el-input v-model="registerForm.department" placeholder="请输入部门" class="form-input"
                                        @focus="onInputFocus" @blur="onInputBlur" />
                                </div>
                            </el-form-item>
                        </div>


                    </div>
                    <!-- 第四行：邀请码 -->
                    <div class="form-row form-row-double">
                        <div class="form-group half-width">
                            <label class="form-label compact-label">公司邀请码</label>
                            <el-form-item prop="invite">
                                <div class="input-wrapper compact-input">
                                    <el-icon class="input-icon">
                                        <Key />
                                    </el-icon>
                                    <el-input v-model="registerForm.invite" placeholder="请输入邀请码" class="form-input"
                                        @focus="onInputFocus" @blur="onInputBlur" />
                                </div>
                            </el-form-item>
                        </div>
                    </div>
                    <div class="form-actions compact-actions">
                        <el-button type="primary" class="submit-btn register-btn" @click="handleRegister"
                            :loading="loading" size="large">
                            {{ loading ? '注册中...' : '创建账户' }}
                        </el-button>
                    </div>
                    <div class="back-button" @click="showLoginForm">
                        <el-icon class="back-icon">
                            <ArrowLeft />
                        </el-icon>
                        <span class="back-text">返回登录</span>
                    </div>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import api from '@/api'
const router = useRouter();

// 显示控制
const loading = ref(false);
const registerFormRef = ref(null);
// 注册表单
const registerForm = ref({
    username: '',
    password: '',
    confirmPassword: '',
    department: '',
    filiale: '',
    invite: ''
});
// 自定义验证规则
const validateUsername = (rule, value, callback) => {
    const regex = /^[a-zA-Z0-9]+$/;
    if (!value) {
        callback(new Error('请输入用户名'));
    } else if (!regex.test(value)) {
        callback(new Error('用户名只能包含英文字母和数字'));
    } else if (value.length < 3 || value.length > 20) {
        callback(new Error('用户名长度在 3 到 20 个字符'));
    } else {
        callback();
    }
};

const validatePassword = (rule, value, callback) => {
    const regex = /^[a-zA-Z0-9]+$/;
    if (!value) {
        callback(new Error('请输入密码'));
    } else if (!regex.test(value)) {
        callback(new Error('密码只能包含英文字母和数字'));
    } else if (value.length < 6) {
        callback(new Error('密码长度至少为 6 个字符'));
    } else {
        callback();
    }
};

const validateConfirmPassword = (rule, value, callback) => {
    if (!value) {
        callback(new Error('请再次输入密码'));
    } else if (value !== registerForm.value.password) {
        callback(new Error('两次输入的密码不一致'));
    } else {
        callback();
    }
};



const registerRules = {
    username: [{ validator: validateUsername, trigger: 'blur' }],
    password: [{ validator: validatePassword, trigger: 'blur' }],
    confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
    department: [{ required: true, message: '请输入部门', trigger: ['blur', 'change'] }],
    position: [
        { required: true, message: '请输入职位', trigger: ['blur', 'change'] },
        { min: 2, max: 20, message: '职位长度在 2 到 20 个字符', trigger: ['blur', 'change'] }
    ],
    invite: [
        {
            required: true,
            message: '请输入邀请码',
            trigger: ['blur', 'change']
        },
        {
            validator: (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请输入邀请码'));
                } else if (value.toLowerCase() !== 'gtgs666888') {
                    callback(new Error('请输入正确的邀请码'));
                } else {
                    callback();
                }
            },
            trigger: ['blur', 'change']
        }
    ]
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
// 注册相关方法
const handleRegister = () => {
    registerFormRef.value.validate((valid) => {
        if (valid) {
            loading.value = true;

            registerUser();
        } else {
            ElMessage.error('请检查输入内容');
        }
    });
};
const showLoginForm = () => {
    // 跳转到登录页面
    router.push({ name: 'login' });
};
const registerUser = () => {
    // 调用本地后端接口
    api.register({
        username: registerForm.value.username,
        password: registerForm.value.password,
        department: registerForm.value.department,
        position: registerForm.value.position,
        invite: registerForm.value.invite,
        name: registerForm.value.name
    },
    )
        .then(data => {
            loading.value = false;
            // 这里写你的业务处理逻辑
            ElMessage.success('注册成功，请登录');
            router.push({ name: 'login' });
        })
        .catch(err => {
            loading.value = false;
            // 错误已自动弹窗，这里可选写自定义处理
        })
}

</script>
<style scoped lang="scss">
.form-container {
    max-height: 100vh;
    // background: linear-gradient(135deg, #eaf4fb 0%, #d6e6f7 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    animation: slideIn 0.5s ease-out;
    z-index: 2;
}

.form-card {
    background: rgba(235, 245, 255, 0.98);
    border-radius: 24px;
    box-shadow: 0 8px 32px 0 rgba(120, 170, 255, 0.13);
    border: 1.5px solid #c7e0fa;
    max-width: 600px;
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

    .form-row.form-row-double {
        display: flex;
        gap: 18px;
    }

    .form-group {
        margin-bottom: 14px;

        &.half-width {
            flex: 1;
        }

        .form-label {
            display: block;
            font-size: 15px;
            font-weight: 500;
            color: #5a7bbd;
            margin-bottom: 10px;
        }

        .input-wrapper {
            position: relative;
            border: 1.5px solid #c7e0fa;
            border-radius: 12px;
            background: #eaf4fb;
            transition: all 0.3s;
            display: flex;
            height: 46px;
            width: 100%;

            :deep(.el-tooltip__trigger) {
                height: 100% !important;
                width: 100% !important;
                padding-left: 49px;
            }

            .form-input {
                :deep(.el-select) {
                    width: 100%;

                    .el-input {
                        .el-input__inner {
                            height: 46px;
                            border: none;
                            border-radius: 0;
                            font-size: 15px;
                            background: transparent;
                            color: #2251a8;
                            box-shadow: none;
                            padding-left: 38px;
                        }

                        .el-input__inner:focus,
                        .el-input__inner:hover {
                            border: none;
                            background: transparent;
                            box-shadow: none;
                        }

                        .el-input__suffix {
                            right: 12px;

                            .el-select__caret {
                                color: #409eff;
                            }
                        }
                    }


                }


            }

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
                transform: translateY(-2px) scale(1.03);
                box-shadow: 0 12px 32px rgba(64, 158, 255, 0.13);
            }
        }
    }

    .back-button {
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
        margin-top: 20px;

        &:hover {
            background: linear-gradient(120deg, #409eff 0%, #5bb6ff 100%);
            color: #fff;
            border-color: #fff;
            box-shadow: 0 6px 20px rgba(64, 158, 255, 0.13);
            transform: translateY(-2px) scale(1.045);
        }

        .back-icon {
            font-size: 19px;
            margin-right: 8px;
            transition: transform 0.3s cubic-bezier(.4, 1, .7, 1.2);
            color: #409eff;
        }

        .back-text {
            white-space: nowrap;
            z-index: 1;
            position: relative;
        }

        &:hover .back-icon {
            transform: translateX(-5px) scale(1.09);
            color: #fff;
        }
    }
}


/* 响应式设计 */
@media (max-width: 900px) {
    .form-card {
        max-width: 100%;
    }

    .form-content {
        padding: 18px 8px;
    }
}
</style>