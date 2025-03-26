<!-- error.vue -->
<script setup lang="ts">
import type { NuxtError } from '#app'

const errorRef = useError()
const error = computed(() => errorRef.value as NuxtError<{
  statusCode?: number
  message?: string
}>)

const errorMessage = computed(() => {
  if (error.value.statusCode === 403) {
    return '账户已被禁用，请联系管理员'
  }
  return error.value.message || '未知错误'
})

const statusCode = computed(() => error.value.statusCode || 500)
</script>

<template>
  <NuxtLayout>
    <div class="error-page">
      <h1 v-if="statusCode">{{ statusCode }}</h1>
      <p>{{ errorMessage }}</p>
      <ElButton @click="clearError({ redirect: '/' })">
        返回首页
      </ElButton>
    </div>
  </NuxtLayout>
</template>