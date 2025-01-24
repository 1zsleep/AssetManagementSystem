<script setup lang="ts">

const store = useStore()


</script>

<template>
  <h1>index</h1>
  <span>{{store.getToken}}</span>
  <el-button @click="store.deleteToken() ">Logout</el-button>
</template>

<style scoped>

</style>