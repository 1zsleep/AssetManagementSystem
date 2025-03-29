<template>
  <div class="gradient-bg">

    <el-card class="login-box">
      <div class="login-header">请登录</div>
      <div class="form-content">
        <form @submit.prevent="handleLogin">
          <el-input
              v-model="username"
              placeholder="账号"
              class="input-field"
              clearable
          />
          <el-input
              v-model="password"
              type="password"
              placeholder="密码"
              class="input-field"
              clearable
              show-password
              @keyup.enter="handleLogin"
          />
          <el-button type="primary" class="login-button" @click="handleLogin">登录</el-button>
        </form>
      </div>
    </el-card>

  </div>
</template>

<script setup>
definePageMeta({
      //layout不展示
      layout: false
    }
);
const username = ref('');
const password = ref('');
const handleLogin = () => {
  userStore().login(username.value, password.value)
};
</script>

<style>
.gradient-bg {
  height: 100vh; /* 使用视口高度 */
  background-image: linear-gradient(to right, #fbc2eb, #a6c1ee);
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  width: 90%; /* 使用百分比 */
  max-width: 358px; /* 设置最大宽度 */
  border-radius: 15px;
  padding: 20px; /* 增加内边距 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.login-header {
  font-size: 28px; /* 调整字体大小 */
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px; /* 增加下边距 */
}

.input-field {
  width: 100%;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  text-align: center;
  margin-top: 20px;
  background-image: linear-gradient(to right, #a6c1ee, #fbc2eb);
  color: #fff;
  border-radius: 8px;
  cursor: pointer; /* 添加光标样式 */
  border: none; /* 移除边框 */
  box-shadow: none; /* 移除阴影 */
  transition: transform 0.1s ease, box-shadow 0.1s ease; /* 添加过渡效果 */
}

.login-button:active {
  transform: scale(0.98); /* 点击时缩小 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* 添加点击时的阴影 */
}
</style>