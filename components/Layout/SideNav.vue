<!-- components/SideNavigation.vue -->
<template>
  <!-- 标题 区域 -->
  <div class="logo-area">
    <span class="logo-text" :style="{ opacity: isCollapsed ? 0 : 1 }">资源门户</span>
  </div>

  <el-menu
      :default-active="activeIndex"
      :default-openeds="openedMenus"
      :collapse="isCollapsed"
      :collapse-transition="true"
      background-color="#002140"
      active-text-color="#1890FF"
      router
  >
    <template v-for="menu in store.filteredMenus" :key="menu.index">
      <el-sub-menu
          :index="menu.index"
          :popper-offset="21"
          :popper-class="menu.popperClass"
      >
        <template #title>
          <el-icon>
            <component :is="menu.icon"/>
          </el-icon>
          <span>{{ menu.title }}</span>
        </template>

        <el-menu-item-group>
          <el-menu-item
              v-for="item in menu.children"
              :key="item.index"
              :index="item.index"
              :route="item.path"
          >
            {{ item.title }}
          </el-menu-item>
        </el-menu-item-group>
      </el-sub-menu>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import {useRoute} from '#app'
import {menuStore} from '~/composables/menuStore'


const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const store = menuStore()

// 路径匹配工具函数
const findActiveMenuIndex = (currentPath: string): string => {
  // 精确匹配子菜单项
  const exactMatch = store.allMenus
      .flatMap(menu => menu.children || [])
      .find(child => child.path === currentPath)

  if (exactMatch) return exactMatch.index

  // 嵌套路径匹配
  const pathSegments = currentPath.split('/').filter(Boolean)
  let bestMatch = {depth: 0, index: ''}

  store.allMenus.forEach(menu => {
    const menuSegments = menu.path.split('/').filter(Boolean)
    const matchDepth = menuSegments.reduce((depth, seg, i) =>
        seg === pathSegments[i] ? depth + 1 : depth, 0
    )

    if (matchDepth > bestMatch.depth) {
      bestMatch = {depth: matchDepth, index: menu.index}
    }
  })

  // 使用路由元数据作为备用方案
  return bestMatch.index || (route.meta.menuIndex as string) || ''
}

// 计算激活菜单项
const activeIndex = computed(() => findActiveMenuIndex(route.path))

// 计算需要展开的父菜单
const openedMenus = computed(() => {
  return store.allMenus
      .filter(menu =>
          menu.children?.some(child =>
              route.path.startsWith(child.path) ||
              route.path === child.path
          )
      )
      .map(menu => menu.index)
})

</script>

<style lang="scss" scoped>
.pop {

  .el-menu--popup {
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


