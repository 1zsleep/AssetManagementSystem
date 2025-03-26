<template>
  <!-- 使用 el-container 创建布局 -->
  <el-container style="height: 100vh;background-color: #f0f2f5;min-width: 1280px;" >
    <!-- 左侧导航栏 -->

    <el-aside :width="isCollapsed ? '88px' : '256px'" class="aside"  style="flex-shrink: 0;">
      <SideNav :is-collapsed="isCollapsed"/>
    </el-aside>

    <!-- 主体内容区域 -->
    <el-container style="min-width: 1024px; overflow: auto;">
      <!-- 顶部工具栏 -->
      <el-header style="padding-right: 0; flex-shrink: 0;">
        <TopBar :is-collapsed="isCollapsed" @toggle-collapse="toggleCollapse"  />
      </el-header>

      <!-- 主体内容区 -->
      <el-main style="padding: 20px; overflow: visible;">

        <NuxtPage />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>


import TopBar from "~/components/Layout/TopBar.vue";
import SideNav from "~/components/Layout/SideNav.vue";

const isCollapsed = ref(false)
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.aside {
  background-color : #002140;
  text-align: start;
}
</style>
