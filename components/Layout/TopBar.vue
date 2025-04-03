<template>
  <!-- 使用 el-header 创建顶部工具栏 -->
  <el-header class="header">
    <div class="header-content">
      <!-- 切换图标 -->
      <div class="square-icon">
        <el-icon
            size="25"
            color="#6e6e6e"
            @click="$emit('toggle-collapse')"
            class="el-dropdown-link"
        >
          <component :is="isCollapsed ? Expand : Fold"/>
        </el-icon>
      </div>
      <!-- 系统名称 -->
      <h1>资源门户 V2.0</h1>
      <div class="user">
        <el-avatar :size="50" :src="circleUrl" />
        <el-dropdown placement="bottom">
        <span class="el-dropdown-link">
          {{ username }}<el-icon> <arrow-down/> </el-icon>
        </span>
          <template #dropdown>
            <el-dropdown-menu style="list-style: none;margin-left:-33px;outline: unset;">
              <el-dropdown-item :icon="SwitchButton" @click="loginOut">
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </el-header>
</template>

<script setup lang="ts">
// 引入Vue和Element Plus相关组件
import {ElDropdown, ElDropdownItem, ElDropdownMenu, ElHeader} from 'element-plus';
import {jwtDecode} from 'jwt-decode';
import {Expand, Fold, SwitchButton} from "@element-plus/icons-vue";
import type {JwtPayload} from "~/types";

defineProps(['isCollapsed'])
defineEmits(['toggle-collapse'])
const loginOut = () => {
  userStore().deleteToken();
  navigateTo("/login");
}
const username = ref("");
const circleUrl = ref("https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png");
onMounted(() => {
  try {
    const token = userStore().getToken;
    if (token) {
      username.value = jwtDecode<JwtPayload>(token).sub; // 解析 token
      http.$get("/users/avatar").then((res) => {
        circleUrl.value = res;
      });
    } else {
      navigateTo("/login");
    }
  } catch (error) {
    console.error("JWT 解码失败", error);
  }
});
</script>

<style scoped>
/* 设置顶部工具栏样式 */
.header {
  background-color: #ffffff;
  margin-left: -15px;
  min-width: 100%; /* 顶部栏最小宽度 */
  flex-shrink: 0; /* 禁止收缩 */
}

/* 设置顶部内容布局 */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
}

.square-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--el-header-height); /* 使用Element的CSS变量 */
  height: var(--el-header-height);
  transition: background-color 0.2s;
  border-radius: 4px;
}

.square-icon:hover {
  background-color: #f0f0f0;
}

.user {
  display: flex;         /* 启用 flex 布局 */
  align-items: center;   /* 垂直居中 */
  gap: 12px;             /* 元素间距 */
  margin-right: 20px;
}

:deep(.el-tooltip__trigger:focus-visible) {
  outline: unset;
}

.el-dropdown-link:focus {
  outline: unset;
}

.el-dropdown--menu___popper {
  outline: unset;
}

.el-dropdown, .el-dropdown * {
  outline: none;
}

</style>
