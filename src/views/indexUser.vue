<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HeaderBar from '@/components/headerbar.vue'
import Sidebar from '@/components/sidebar.vue'
</script>
<template>
    <div class="app-container">
        <el-container>
            <el-header>
                <HeaderBar />
            </el-header>
            <el-container class="main-container">
                <el-aside width="200px">
                    <Sidebar />
                </el-aside>
                <el-main><router-view /></el-main>
            </el-container>
        </el-container>
    </div>
</template>

<style scoped lang="scss">
.app-container {
    height: 100vh;
    width: 100vw;

    .el-header {
        background-color: #409EFF;
        color: white;
        padding: 0;
        height: 60px;
    }

    .main-container {
        display: flex;
        height: calc(100vh - 60px);
    }

    .el-aside {
        background-color: #fff;
        border-right: 1px solid #e6e6e6;
        overflow-y: auto;
        position: relative;

        // 自定义滚动条样式，使其浮在内容上
        &::-webkit-scrollbar {
            width: 6px;
            position: absolute;
            right: 0;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }

        &::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 3px;

            &:hover {
                background: rgba(0, 0, 0, 0.4);
            }
        }
    }

    .el-main {
        overflow-y: auto;
        position: relative;
        padding: 20px;

        // 主内容区域的自定义滚动条
        &::-webkit-scrollbar {
            width: 0px;

        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }

        &::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 3px;

            &:hover {
                background: rgba(0, 0, 0, 0.4);
            }
        }
    }
}
</style>
