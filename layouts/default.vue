<template>
  <!-- 使用 el-container 创建布局 -->
  <el-container style="height: 100vh;background-color: #f0f2f5" >
    <!-- 左侧导航栏 -->
    <el-aside :width="isCollapsed ? '88px' : '256px'" class="aside">
      <SideNav :is-collapsed="isCollapsed"/>
    </el-aside>

    <!-- 主体内容区域 -->
    <el-container>
      <!-- 顶部工具栏 -->
      <el-header style="padding-right: 0">
        <TopBar :is-collapsed="isCollapsed" @toggle-collapse="toggleCollapse"  />
      </el-header>

      <!-- 主体内容区 -->
      <el-main>
        <!-- 这里是主体内容，暂时空白 -->
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import SideNav from "~/components/Layout/SideNav.vue";
import TopBar from "~/components/Layout/TopBar.vue";

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
