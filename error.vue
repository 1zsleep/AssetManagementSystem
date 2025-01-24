<!-- 错误页. 不管是 404 还是 500 还是其他错误都会自动到这个页面来 -->
<template>
  <div>
    <!--  服务端跳转这里可以根据 "statusCode": 404 来判断是404还是500 来进行展示  -->
    <!--  客户端错误过来的，是没有code的, 数据直接就是 Error: xxx错误信息，需要根据自定义的错误内容来判断  -->
    <h2> 错误页 </h2>
    <pre>
            { { error } }
       </pre>
  </div>

</template>

<script setup lang="ts">
defineProps({
  error: Object
})
</script>

<style scoped>
</style>