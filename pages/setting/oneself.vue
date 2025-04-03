<template>
  <div class="settings-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>个人设置</span>
        </div>
      </template>

      <!-- 头像上传 -->
      <div class="avatar-section">
        <el-form label-width="100px">
          <el-form-item label="头像">
            <div class="avatar-uploader">
              <el-avatar :size="120" :src="avatarUrl" class="fixed-circle"/>
              <el-upload
                  class="avatar-upload"
                  :show-file-list="false"
                  :before-upload="beforeAvatarUpload"
                  :disabled="uploading"
              >
                <el-button
                    type="primary"
                    size="small"
                    :loading="uploading"
                >
                  {{ uploading ? '上传中...' : '更换头像' }}
                </el-button>
              </el-upload>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- 用户信息表单 -->
      <el-form
          :model="form"
          :rules="rules"
          label-width="100px"
          @submit.prevent="handleSubmit"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="form.userName"/>
        </el-form-item>

        <el-form-item label="新密码" prop="password">
          <el-input
              v-model="form.password"
              type="password"
              autocomplete="new-password"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              v-model="form.confirmPassword"
              type="password"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" native-type="submit">保存更改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-dialog v-model="cropperVisible" title="剪裁头像" width="60%">
      <vue-picture-cropper
          v-if="cropperVisible"
          ref="cropperRef"
          :img="cropperImg"
          :options="{
            viewMode: 1,
            dragMode: 'move',
            aspectRatio: 1,
            autoCropArea: 1,
            cropBoxResizable: false,
            guides: false
          }"
          :boxStyle="{
            width: '100%',
            height: '100%',
            backgroundColor: '#f8f8f8',
            margin: 'auto',
          }"
          :presetMode="{
            mode: 'round',
            width: 200,
            height: 200,
          }"
      />
      <template #footer>
        <el-button @click="cropperVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCrop">确认剪裁</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {ElMessage} from 'element-plus'
import VuePictureCropper, { cropper } from 'vue-picture-cropper'

// 用户信息表单
const form = ref({
  userName: '',
  password: '',
  confirmPassword: ''
})
// 头像相关状态
const avatarUrl = ref('')
const uploading = ref(false)
const cropperVisible = ref(false)
const cropperImg = ref('')

const beforeAvatarUpload = (file: File) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件')
    return false
  }

  // 读取文件并显示剪裁框
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    cropperImg.value = reader.result as string
    cropperVisible.value = true
  }
  return false // 阻止自动上传
}
const confirmCrop = async () => {
  cropper?.getFile().then(file => {
    const formData = new FormData()
    formData.append('file', file)
    http.$post('/users/avatar', formData).then(res => {
      ElMessage.success('头像更新成功')
      avatarUrl.value = res
      cropperVisible.value = false
    }).catch(error => {
      ElMessage.error(error.message || '上传失败')
    }).finally(() => {
      uploading.value = false
    })
  })

}
// 获取用户信息
const fetchUserInfo = async () => {
  await http.$get('/users/avatar').then(res => {
    console.log(res)
    avatarUrl.value = res|| ''
  }).catch(error => {
    ElMessage.error(error)
  })
}
const validatePassword = (rule:any, value:any, callback:any) => {
  if (form.value.password && value !== form.value.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = ref({
  password: [
    {min: 6, max: 20, message: '密码长度需在6-20个字符之间', trigger: 'blur'}
  ],
  confirmPassword: [
    {validator: validatePassword, trigger: 'blur'}
  ]
})

// 确认剪裁


// 提交表单
const handleSubmit = async () => {
  try {
    const payload = {
      userName: "",
      userPassword: ""
    }
    if (form.value.userName) {
      payload.userName = form.value.userName
    }
    if (form.value.password) {
      payload.userPassword = form.value.password
    }

    await http.$patch('/users', payload)
    ElMessage.success('信息更新成功')
  } catch (error:any) {
    ElMessage.error(error.message || '更新失败')
  }
}

onMounted(async () => {
  await fetchUserInfo()
})


</script>

<style scoped>

.settings-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

.avatar-section {
  margin-bottom: 30px;
  text-align: center;
}

.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.fixed-circle {
  border-radius: 50%;
  overflow: hidden;
}

.fixed-circle :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.cropper-container {
  position: relative;
  height: 400px;
  background: #f8f8f8;
}

:deep(.cropper-view-box) {
  border-radius: 50% !important;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.8);
}

:deep(.cropper-drag-box) {
  background: rgba(0, 0, 0, 0.3);
}

:deep(.cropper-face) {
  background: transparent !important;
}

:deep(.cropper-line) {
  display: none !important;
}

:deep(.cropper-point) {
  display: none !important;
}
</style>