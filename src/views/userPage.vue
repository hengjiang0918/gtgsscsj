<template>
    <div class="login-container">
        <div class="background-decoration">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
            <div class="circle circle-3"></div>
            <!-- 新增蓝色气泡点缀 -->
            <div class="bubble bubble1"></div>
            <div class="bubble bubble2"></div>
            <div class="bubble bubble3"></div>
            <div class="bubble bubble4"></div>
        </div>
        <div class="form-container">
            <router-view></router-view>
        </div>
    </div>
</template>

<script setup>
</script>

<style scoped lang="scss">
.login-container {
    height: 100vh;
    width: 100vw;
    background: linear-gradient(135deg, #eaf4fb 0%, #d6e6f7 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-sizing: border-box;
    overflow: hidden;

    .background-decoration {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;

        .circle {
            position: absolute;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(124, 77, 255, 0.18), rgba(92, 107, 192, 0.13));
            animation: float 6s ease-in-out infinite;

            &.circle-1 {
                width: 160px;
                height: 160px;
                top: 10%;
                left: 8%;
                animation-delay: 0s;
                background: linear-gradient(135deg, rgba(124, 77, 255, 0.22), rgba(92, 107, 192, 0.18));
                filter: blur(2px);
            }

            &.circle-2 {
                width: 120px;
                height: 120px;
                top: 55%;
                right: 10%;
                animation-delay: 2s;
                background: linear-gradient(135deg, rgba(92, 107, 192, 0.18), rgba(124, 77, 255, 0.13));
                filter: blur(1.5px);
            }

            &.circle-3 {
                width: 90px;
                height: 90px;
                bottom: 18%;
                left: 14%;
                animation-delay: 4s;
                background: linear-gradient(135deg, rgba(124, 77, 255, 0.13), rgba(92, 107, 192, 0.11));
                filter: blur(1.5px);
            }
        }

        // 新增蓝色气泡点缀
        .bubble {
            position: absolute;
            border-radius: 50%;
            opacity: 0.38;
            filter: blur(2px);
            animation: float 8s ease-in-out infinite alternate;
        }

        .bubble1 {
            width: 140px;
            height: 140px;
            left: 60%;
            top: 8%;
            background: radial-gradient(circle at 30% 30%, #5bb6ff 0%, #3a3d5c 100%);
            animation-delay: 0s;
        }

        .bubble2 {
            width: 90px;
            height: 90px;
            right: 18%;
            top: 38%;
            background: radial-gradient(circle at 70% 30%, #409eff 0%, #23243a 100%);
            animation-delay: 2s;
        }

        .bubble3 {
            width: 70px;
            height: 70px;
            left: 22%;
            bottom: 12%;
            background: radial-gradient(circle at 60% 60%, #5bb6ff 0%, #23243a 100%);
            animation-delay: 4s;
        }

        .bubble4 {
            width: 110px;
            height: 110px;
            right: 8%;
            bottom: 18%;
            background: radial-gradient(circle at 40% 70%, #3a3d5c 0%, #409eff 100%);
            animation-delay: 1.5s;
        }
    }


}

/* 响应式设计 */
@media (max-width: 768px) {
    .login-container {
        padding: 12px;

        .form-container {
            width: 100%;
        }
    }
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0px) scale(1);
        opacity: 0.8;
    }

    50% {
        transform: translateY(-10px) scale(1.03);
        opacity: 1;
    }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>