<!-- pages/fileManagement/group.vue -->
<script setup lang="ts">
import {Delete, Document, Download, Plus, Refresh, Search, Upload} from '@element-plus/icons-vue'
import type {ImageInstance} from 'element-plus'
import {ElMessage} from 'element-plus'
import {useDebounceFn} from '@vueuse/core'
import dayjs from 'dayjs'
import {jwtDecode} from 'jwt-decode'

interface AssetFile {
  id: number
  fileName: string
  fileType: string
  fileSize: number
  createdAt: string
  thumbnailUrl?: string
  cosKey: string
}

type Visibility = 'PUBLIC' | 'GROUP' | 'PRIVATE'

// 响应式状态
const searchValue = ref('')
const pageSize = ref(10)
const currentPage = ref(1)
const total = ref(0)
const rawFileList = ref<AssetFile[]>([])
const selectedFiles = ref<number[]>([])
const visibility = ref<Visibility>('GROUP')
const groupOptions = ref<{ value: number, label: string }[]>([])
const selectedGroup = ref<number>()
const srcList = ref<string[]>([])
const imageRef = ref<ImageInstance>()
// 上传相关状态
const uploadDialogVisible = ref(false)
const uploadVisibility = ref<Visibility>('PRIVATE')
const tempFile = ref<File | null>(null)
const loading = ref(false)
const fileInput = ref<HTMLInputElement>()

// 文件类型和大小筛选
const selectedType = ref('all')
const selectedSize = ref('all')
const fileTypes = [
  {value: 'all', label: '全部类型'},
  {value: 'image', label: '图片'},
  {value: 'video', label: '视频'},
  {value: 'document', label: '文档'},
  {value: 'other', label: '其他'}
]
const fileSizes = [
  {value: 'all', label: '全部大小'},
  {value: 'small', label: '< 1MB'},
  {value: 'medium', label: '1MB - 5MB'},
  {value: 'large', label: '> 5MB'}
]

// 计算过滤后的文件列表
const fileList = computed(() => {
  return rawFileList.value.filter(file => {
    const typeMatch = selectedType.value === 'all' ||
        (selectedType.value === 'image' && file.fileType.startsWith('image/')) ||
        (selectedType.value === 'video' && file.fileType.startsWith('video/')) ||
        (selectedType.value === 'document' && (
            file.fileType.includes('pdf') ||
            file.fileType.includes('msword') ||
            file.fileType.includes('excel') ||
            file.fileType.includes('powerpoint')
        )) ||
        (selectedType.value === 'other' && ![
          'image', 'video', 'pdf',
          'msword', 'excel', 'powerpoint'
        ].some(t => file.fileType.includes(t)))

    const sizeInMB = file.fileSize / 1024 / 1024
    const sizeMatch = selectedSize.value === 'all' ||
        (selectedSize.value === 'small' && sizeInMB < 1) ||
        (selectedSize.value === 'medium' && sizeInMB >= 1 && sizeInMB <= 5) ||
        (selectedSize.value === 'large' && sizeInMB > 5)

    return typeMatch && sizeMatch
  })
})

// 获取当前用户信息
const getCurrentUser = () => {
  const token = userStore().token
  if (!token) throw new Error('未获取到用户信息')
  return jwtDecode<{ id: number }>(token)
}

// 加载用户群组
const loadUserGroups = async () => {
  try {
    loading.value = true
    const userId = getCurrentUser().id
    const groupIds = await http.$get(`/groups/user/${userId}`) as number[]
    const groups = await Promise.all(groupIds.map(id =>
        http.$get(`/groups/${id}`).then(res => ({
          value: id,
          label: res.data.groupName
        }))
    ))
    groupOptions.value = groups
    if (groups.length > 0) selectedGroup.value = groups[0].value
  } catch (error) {
    ElMessage.error('获取用户组失败')
  } finally {
    loading.value = false
  }
}

// 加载文件列表（修复分页参数）
const loadFiles = async () => {
  loading.value = true
  const params = {
    offset: Math.max((currentPage.value - 1) * pageSize.value, 0),
    limit: Math.min(Math.max(pageSize.value, 1), 100),
    visibility: visibility.value,
    ownerGroupId: selectedGroup.value,
    filter: searchValue.value ? `fileName like %${searchValue.value}%` : ''
  }
  await http.$get('/assets/files', params)
      .then(res => {
        rawFileList.value = res.items || []
        total.value = res.total || 0
      }).catch(error => {
        ElMessage.error('获取文件列表失败')
        rawFileList.value = []
        total.value = 0
      }).finally(() => loading.value = false)
  for (let i = 0; i < fileList.value.length; i++) {
    const file = fileList.value[i]
    await http.$get(`/assets/files/${file.id}/preview-url`).then(
        res => {
          srcList.value.push(res.data)
          file.thumbnailUrl = res.data
        }
    )
  }

}

// 上传对话框逻辑
const showUploadDialog = () => uploadDialogVisible.value = true

const handleFileSelect = (file: File) => {
  if (file.size > 100 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过100MB')
    return
  }
  tempFile.value = file
}

const removeFile = () => {
  tempFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const confirmUpload = async () => {
  if (!tempFile.value) {
    ElMessage.warning('请先选择要上传的文件')
    return
  }

  const currentUser = getCurrentUser()
  const formData = new FormData()

  // 严格匹配后端参数名称
  formData.append('file', tempFile.value)
  formData.append('visibility', uploadVisibility.value)
  formData.append('uploadUserId', currentUser.id.toString())

  switch (uploadVisibility.value) {
    case 'PRIVATE':
      formData.append('ownerUserId', currentUser.id.toString())
      break
    case 'GROUP':
      if (!selectedGroup.value) throw new Error('请选择所属群组')
      formData.append('ownerGroupId', selectedGroup.value.toString())
      break
  }

  await http.$post('/assets/files/upload', formData).then(res => {
    ElMessage.success('上传成功')
    loadFiles()
  }).catch(error => {
    ElMessage.error('上传失败: ' + (error as Error).message)
  }).finally(() => tempFile.value = null)
}

// 初始化
onMounted(async () => {
  await loadUserGroups()
  await loadFiles()
})

// 下载文件
const handleDownload = async (file: AssetFile) => {
  try {
    const res = await http.$get(`/assets/files/${file.id}/download-url`)
    const link = document.createElement('a')
    link.href = res.data
    link.download = file.fileName
    console.log(link)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    ElMessage.error('下载失败: ' + (error as Error).message)
  }
}

// 预览文件
const handlePreview = async (file: AssetFile) => {
  try {
    const res = await http.$get(`/assets/files/${file.id}/preview-url`)
    window.open(res.data, '_blank', 'noopener,noreferrer')
  } catch (error) {
    ElMessage.error('预览失败: ' + (error as Error).message)
  }
}
// 拖拽处理方法
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  if (!e.dataTransfer?.files) return

  const file = e.dataTransfer.files[0]
  if (file) {
    handleFileSelect(file)
  }
}
// 搜索防抖
const debouncedSearch = useDebounceFn(loadFiles, 500)
</script>

<template>
  <div class="page-container">
    <div class="card-container">
      <!-- 工具栏 -->
      <div class="toolbar">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="6" :md="4">
            <el-select
                v-model="selectedType"
                @change="loadFiles"
                placeholder="文件类型"
            >
              <el-option
                  v-for="type in fileTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
              />
            </el-select>
          </el-col>

          <el-col :xs="24" :sm="6" :md="4">
            <el-select
                v-model="selectedSize"
                @change="loadFiles"
                placeholder="文件大小"
            >
              <el-option
                  v-for="size in fileSizes"
                  :key="size.value"
                  :label="size.label"
                  :value="size.value"
              />
            </el-select>
          </el-col>

          <el-col :xs="24" :sm="6" :md="4">
            <el-select
                v-model="selectedGroup"
                placeholder="选择群组"
                :disabled="!groupOptions.length"
                @change="loadFiles"
            >
              <el-option
                  v-for="group in groupOptions"
                  :key="group.value"
                  :label="group.label"
                  :value="group.value"
              />
            </el-select>
          </el-col>

          <el-col :xs="24" :sm="6" :md="10">
            <el-input
                v-model="searchValue"
                placeholder="搜索文件名"
                clearable
                @input="debouncedSearch"
            >
              <template #append>
                <el-button :icon="Search"/>
              </template>
            </el-input>
          </el-col>

          <el-col :xs="24" :sm="4" :md="2">
            <el-button
                type="primary"
                :icon="Plus"
                @click="showUploadDialog"
            >
              上传
            </el-button>
          </el-col>

          <el-col :xs="24" :sm="4" :md="2">
            <el-tooltip content="刷新列表">
              <el-button
                  :icon="Refresh"
                  circle
                  @click="loadFiles"
                  :loading="loading"
              />
            </el-tooltip>
          </el-col>
        </el-row>
      </div>

      <!-- 文件列表 -->
      <el-skeleton :loading="loading" animated :count="5">
        <template #template>
          <el-row :gutter="20">
            <el-col
                v-for="i in 5"
                :key="i"
                :xs="24"
                :sm="12"
                :md="8"
                :lg="6"
                :xl="4"
            >
              <el-skeleton-item variant="image" class="skeleton-image"/>
              <el-skeleton-item variant="text" class="skeleton-text"/>
              <el-skeleton-item variant="text" class="skeleton-text"/>
            </el-col>
          </el-row>
        </template>

        <template #default>
          <!-- 空状态提示 -->
          <div v-if="fileList.length === 0" class="empty-container">
            <el-empty
                description="暂无文件"
                :image-size="200"
            >
              <template #image>
                <el-icon :size="80" color="#909399">
                  <Document/>
                </el-icon>
              </template>
              <template #description>
                <div class="empty-tips">
                  <p style="margin-bottom: 20px;">当前群组尚未上传任何文件</p>
                  <el-button
                      type="primary"
                      :icon="Plus"
                      @click="showUploadDialog"
                  >
                    立即上传
                  </el-button>
                </div>
              </template>
            </el-empty>
          </div>

          <!-- 文件列表 -->
          <div v-else class="card-grid">
            <el-row :gutter="20">
              <el-col
                  v-for="(file,index) in fileList"
                  :key="index"
                  :xs="24"
                  :sm="12"
                  :md="8"
                  :lg="6"
                  :xl="4"
              >
                <el-card
                    class="file-card"
                    shadow="hover"
                    @mouseenter="selectedFiles = [file.id]"
                    @mouseleave="selectedFiles = []"
                >
                  <template #header>
                    <div>
                      <el-image
                          ref="imageRef"
                          :src="file.thumbnailUrl"
                          :alt="file.fileName"
                          :zoom-rate="1.2"
                          :preview-src-list="srcList"
                          :initial-index="index"
                          fit="cover"
                          @error="file.thumbnailUrl = '/default-thumbnail.png'"
                      />

                      <div class="card-actions" v-show="selectedFiles.includes(file.id)">
                        <el-button
                            type="primary"
                            :icon="Download"
                            circle
                            @click="handleDownload(file)"
                        />
                      </div>
                    </div>
                  </template>

                  <div class="file-info">
                    <div class="file-name">{{ file.fileName }}</div>
                    <div class="file-meta">
                      <span>{{ dayjs(file.createdAt).format('YYYY-MM-DD') }}</span>
                      <span>{{ (file.fileSize / 1024 / 1024).toFixed(1) }}MB</span>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-skeleton>

      <!-- 分页 -->
      <div v-if="fileList.length > 0" class="pagination-section">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30]"
            layout="total, sizes, prev, pager, next"
            :total="total"
            @size-change="loadFiles"
            @current-change="loadFiles"
        />
      </div>
    </div>

    <!-- 上传对话框 -->
    <el-dialog
        v-model="uploadDialogVisible"
        title="上传文件"
        width="600px"
        :close-on-click-modal="false"
    >
      <div class="upload-dialog">
        <div
            class="drag-area"
            @dragover.prevent
            @drop.prevent="handleDrop"
            @click="fileInput?.click()"
        >
          <template v-if="!tempFile">
            <el-icon class="upload-icon">
              <Upload/>
            </el-icon>
            <div class="upload-tips">
              <p>点击选择文件或拖拽到此处</p>
              <p class="tip">最大支持100MB文件</p>
            </div>
            <input
                ref="fileInput"
                type="file"
                hidden
                @change="e => handleFileSelect((e.target as HTMLInputElement).files?.[0]!)"
            />
          </template>

          <div v-else class="selected-file">
            <el-icon>
              <Document/>
            </el-icon>
            <div class="file-info">
              <div class="file-name">{{ tempFile.name }}</div>
              <div class="file-size">
                {{ (tempFile.size / 1024 / 1024).toFixed(2) }} MB
              </div>
            </div>
            <el-button
                type="danger"
                circle
                :icon="Delete"
                @click="removeFile"
            />
          </div>
        </div>

        <el-form label-width="80px">
          <el-form-item label="可见性" required>
            <el-select v-model="uploadVisibility">
              <el-option label="私有（仅自己）" value="PRIVATE"/>
              <el-option label="群组共享" value="GROUP"/>
              <el-option label="公开访问" value="PUBLIC"/>
            </el-select>
          </el-form-item>

          <el-form-item
              v-if="uploadVisibility === 'GROUP'"
              label="目标群组"
              required
          >
            <el-select
                v-model="selectedGroup"
                placeholder="请选择群组"
                :disabled="!groupOptions.length"
                filterable
                clearable
            >
              <el-option
                  v-for="group in groupOptions"
                  :key="group.value"
                  :label="group.label"
                  :value="group.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button
            type="primary"
            @click="confirmUpload"
            :disabled="!tempFile || (uploadVisibility === 'GROUP' && !selectedGroup)"
        >
          开始上传
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>


<style lang="scss" scoped>
.list-thumbnail {
  width: 100px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

@mixin text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-container {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 40px);

  .card-container {
    background: var(--el-bg-color);
    border-radius: 12px;
    box-shadow: var(--el-box-shadow-light);
    padding: 24px;

    .toolbar {
      margin-bottom: 24px;

      .el-select, .el-input {
        width: 100%;
      }

      .el-col {
        margin-bottom: 12px;
        display: flex;
        align-items: center;
      }
    }

    .skeleton-image {
      height: 200px;
      margin-bottom: 12px;
      border-radius: 8px;
    }

    .skeleton-text {
      width: 80%;
      margin: 8px auto;
      height: 16px;
    }

    .empty-container {
      padding: 60px 0;
      text-align: center;

      .empty-tips {
        display: flex;
        flex-direction: column;
        gap: 16px;

        p {
          color: var(--el-text-color-secondary);
          margin: 0;
          font-size: 14px;
        }
      }
    }

    .card-grid {
      margin: 24px 0;

      .file-card {
        position: relative;
        margin-bottom: 20px;
        transition: transform 0.3s var(--el-transition-function-ease-in-out-bezier);

        :deep(.el-card__header) {
          padding: 0;
          border-bottom: none;
        }

        .card-thumbnail {
          position: relative;
          height: 200px;
          overflow: hidden;
          background-color: var(--el-fill-color-light);
          border-radius: 8px 8px 0 0;

          .thumbnail-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
          }

          .thumbnail-placeholder {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: var(--el-text-color-placeholder);
            text-transform: uppercase;
            letter-spacing: 2px;
          }
        }

        .card-actions {
          position: absolute;
          bottom: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
          background: rgba(255, 255, 255, 0.9);
          padding: 6px;
          border-radius: 20px;
          box-shadow: var(--el-box-shadow-light);
          backdrop-filter: blur(4px);
          opacity: 0;
          transition: opacity 0.2s;

          .el-button {
            --el-button-size: 32px;
            width: var(--el-button-size);
            height: var(--el-button-size);
            padding: 0;
          }
        }

        &:hover .card-actions {
          opacity: 1;
        }

        .file-info {
          padding: 16px;

          .file-name {
            font-weight: 500;
            margin-bottom: 8px;
            @include text-ellipsis;
            color: var(--el-text-color-primary);
          }

          .file-meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: var(--el-text-color-secondary);

            span {
              display: inline-flex;
              align-items: center;
              gap: 4px;
            }
          }
        }
      }
    }

    .pagination-section {
      margin-top: 24px;
      display: flex;
      justify-content: center;
    }
  }
}

.upload-dialog {
  .drag-area {
    border: 2px dashed var(--el-border-color);
    border-radius: 8px;
    padding: 40px 20px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.3s;
    margin-bottom: 24px;

    &:hover {
      border-color: var(--el-color-primary);
    }

    .upload-icon {
      font-size: 48px;
      color: var(--el-text-color-secondary);
      margin-bottom: 16px;
    }

    .upload-tips {
      color: var(--el-text-color-regular);

      p {
        margin: 4px 0;
        font-size: 14px;

        &.tip {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .selected-file {
    display: flex;
    align-items: center;
    padding: 12px;
    background: var(--el-fill-color-light);
    border-radius: 8px;
    gap: 12px;

    .el-icon {
      font-size: 32px;
      color: var(--el-text-color-secondary);
    }

    .file-info {
      flex: 1;

      .file-name {
        @include text-ellipsis;
        margin-bottom: 4px;
      }

      .file-size {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 12px;

    .card-container {
      padding: 16px;

      .toolbar {
        .el-col {
          margin-bottom: 8px;
        }
      }

      .file-card {
        .card-thumbnail {
          height: 160px;
        }

        .file-info {
          padding: 12px;
        }
      }
    }
  }


  .upload-dialog {
    .drag-area {
      padding: 24px 12px;
    }
  }
}
</style>