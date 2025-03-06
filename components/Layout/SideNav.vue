<!-- components/SideNavigation.vue -->
<template>
  <!-- 标题 区域 -->
  <div class="logo-area">
    <!-- 根据折叠状态显示/隐藏文字 -->
    <span class="logo-text" :style="{ opacity: isCollapsed ? 0 : 1 }">资源门户</span>
  </div>

  <el-menu
      :collapse="isCollapsed"
      :collapse-transition="true"
      default-active="1"
      background-color="#002140"
      active-text-color="#1890FF"
  >
    <el-sub-menu index="1" :popper-offset="21">
      <template #title class="">
        <el-icon><Message /></el-icon>
        <span>导航一</span>
      </template>
      <el-menu-item-group >
        <el-menu-item index="1-1">选项1</el-menu-item>
        <el-menu-item index="1-2">选项2</el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>

    <el-sub-menu index="2"  popper-class="pop" >
      <template #title>
        <el-icon><Delete /></el-icon>
        <span>导航二</span>
      </template>
      <el-menu-item-group>
        <el-menu-item index="2-1">选项1</el-menu-item>
        <el-menu-item index="2-2">选项2</el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>
  </el-menu>

</template>

<script setup lang="ts">

import {Delete, Message} from "@element-plus/icons-vue";

defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
.pop{

  .el-menu--popup{
    margin-left: 200px !important;
    background-color: red;
  }
}
.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #002140;
  transition: all 0.3s;
  .logo-text {
    color: #fff;
    font-size: 20px;
    font-weight: 600;
    white-space: nowrap;
    opacity: 1;
    transition: opacity 0.3s;
  }
}

/* 深度选择器覆盖Element样式 */
:deep() {

  /* 一级菜单样式 */
  .el-sub-menu {
    outline: 1px solid #002140; /* 保留outline样式 */
    background-color: #002140;

    &__title {
      color: #999 !important;
      &:hover {
        color: #fff !important;
        background-color: #002140;
      }
      .el-icon {
        color: inherit;
      }
    }

    /* 展开时标题颜色 */
    &.is-opened > .el-sub-menu__title {
      color: #fff !important;
    }

    &__icon-arrow {
      color: rgba(255, 255, 255, 0.6) !important;
      margin-left: 8px !important;
      font-size: 14px;
      transition: all 0.3s;

      &:hover {
        color: #fff !important;
      }
    }
  }

  /* 当菜单折叠时隐藏箭头 */
  .el-menu.is-collapsed {
    .el-sub-menu__icon-arrow {
      display: none !important;
    }

    /* 调整图标间距 */
    .el-icon {
      margin-right: 0 !important;
    }
  }

  /* 统一菜单项样式 */
  .el-menu-item {
    color: #999 !important;
    min-width: 200px;

    &:hover {
      color: #fff !important;
      background-color: rgba(255, 255, 255, 0.1) !important;
    }

    /* 选中状态 */
    &.is-active {
      background-color: #1890FF !important;
      color: #fff !important;
    }
  }

  /* 二级菜单容器 */
  .el-menu {
    background-color: #001528 !important;
    padding-left: 10px;
  }

  /* 分组标题样式 */
  .el-menu-item-group__title {
    padding: 0;
    color: #666;
  }
}
</style>


