<script setup lang="ts">

import {Refresh, Search} from "@element-plus/icons-vue";
import dayjs from "dayjs";
import {useDebounceFn} from "@vueuse/core";
import {jwtDecode} from "jwt-decode";
import type {Book, JwtPayload} from "~/types";

const dialogVisible = ref(false)
const editDialogVisible= ref(false)
const searchValue = ref('')
const pageSize = ref(10)
const currentPage = ref(1)
const total = ref(0)
const tableData = ref<Book[]>([])
const currentUser = reactive({
  id: -1,
  isAdmin: false
})
const form = reactive({
  name: '',
  description: '',
  unit: '',
  annualLimit: 0,
  currentStock: 0,
})
const applyDialogVisible = ref(false)
const selectedItemId = ref<number | null>(null)
const applyForm = reactive({
  quantity: 0
})

const getItemList = () => {
  getCurrentUserInfo()
  const params: Record<string, any> = {
    offset: (currentPage.value - 1) * pageSize.value,
    limit: pageSize.value
  }
  let filter = ''
  if (searchValue.value.trim()) {
    filter = `title like %${searchValue.value}%`
  }
  if (filter) params.filter = filter

  http.$get('/book', params).then(res => {
    console.log(res)
    tableData.value = res.items
    total.value = res.total
  }).catch(error => {
    ElMessage.error('获取书籍列表失败')
  })
}
const request = (itemId: number) => {
  http.$post('/book',itemId).then(res => {
    if (res.message) {
      ElMessage.error(res.message.split(": ")[1])
      return
    }
    ElMessage.success('申请成功,等待审批')
    getItemList()
  }).catch(error => {
    ElMessage.error('申请失败')
  })
}

// 工具方法------------------------------------------------
const getCurrentUserInfo = () => {
  try {
    const token = userStore().token
    if (!token) throw new Error('未获取到用户信息')
    const decoded = jwtDecode<JwtPayload>(token)
    currentUser.id = decoded.id
    currentUser.isAdmin = decoded.roles.includes('管理员') // 根据实际角色字段调整
    return decoded
  } catch (error) {
    ElMessage.error('获取用户信息失败')
    throw error
  }
}
const debouncedSearch = useDebounceFn(getItemList, 500)
onMounted(() => {
  getItemList()
})
</script>

<template>
  <div class="page-container">
    <div class="card-container">
      <div class="toolbar">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="6" :md="4">

          </el-col>

          <el-col :xs="24" :sm="14" :md="18">
            <el-input
                v-model="searchValue"
                placeholder="搜索书籍名称"
                clearable
                @input="debouncedSearch"
                @clear="getItemList"
            >
              <template #append>
                <el-button :icon="Search" @click="getItemList"/>
              </template>
            </el-input>
          </el-col>

          <el-col :xs="24" :sm="4" :md="2">
            <el-tooltip content="刷新">
              <el-button :icon="Refresh" circle @click="getItemList"/>
            </el-tooltip>
          </el-col>
        </el-row>
      </div>

      <div class="table-section">
        <el-table
            :data="tableData"
            stripe
            style="width: 100%"
            :header-cell-style="{
            textAlign: 'center',
            fontWeight: 600,
            backgroundColor: '#f8f9fa'
          }"
        >
          <el-table-column prop="bookId" label="ID" align="center" width="80"/>
          <el-table-column
              prop="title"
              label="书名"
              header-align="center"
              align="center"
              class-name="uniform-column"
          />
          <el-table-column label="作者" header-align="center" align="center" class-name="uniform-column">
            <template #default="{ row }">
              <div class="cell-content">
                {{ row.author }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="出版社" header-align="center" align="center" width="120">
            <template #default="{ row }">
              {{ row.publisher}}
            </template>
          </el-table-column>
          <el-table-column label="总库存数量" header-align="center" align="center" width="120">
            <template #default="{ row }">
              {{ row.stockQuantity}}
            </template>
          </el-table-column>
          <el-table-column label="入库日期" header-align="center" align="center" class-name="uniform-column">
            <template #default="{ row }">
              <div class="cell-content">
                {{ dayjs(row.purchaseDate).format('YYYY-MM-DD HH:mm') }}
              </div>
            </template>
          </el-table-column>
          <el-table-column v-if="!currentUser.isAdmin" label="操作" align="center" class-name="uniform-column" width="180">
            <template #default="{ row }">
              <el-button  type="primary" size="small" @click="request(row.bookId)">
                申请
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-section">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 15, 20, 30]"
            :background="true"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="getItemList"
            @current-change="getItemList"
        />
      </div>
    </div>

  </div>
</template>

<style scoped>
/* 保持原有样式不变 */
.page-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.card-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
}

.table-section {
  margin: 20px 0;
}

.pagination-section {
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

:deep(.uniform-column) {
  width: 1%;
  flex: 1 0 0;
}

.cell-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 10px;
  text-align: center;
  width: 100%;
}

:deep(.el-select__tags) {
  flex-wrap: nowrap;
  overflow-x: auto;
  max-width: 400px;
}

:deep(.el-select__tags::-webkit-scrollbar) {
  display: none;
}

:deep(.el-table) {
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
}

:deep(.el-table__header-wrapper) {
  flex: 0 0 auto;
}

:deep(.el-table__body-wrapper) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.el-table__body) {
  flex: 1;
}

:deep(.el-table td.el-table__cell),
:deep(.el-table th.el-table__cell) {
  text-align: center !important;
  vertical-align: middle;
}

:deep(.el-table__header) th {
  background-color: #f8f9fa !important;
}

.dialog-footer {
  text-align: center;
  padding: 20px 0 0;
}

:deep(.el-button + .el-button) {
  margin-left: 8px;
}

.selected-user {
  margin-right: 8px;
  color: #409eff;
  font-weight: 500;
}

@media (max-width: 768px) {
  .card-container {
    padding: 15px;
  }

  .toolbar .el-col {
    margin-bottom: 10px;
  }

  :deep(.el-table) {
    font-size: 14px;
  }

  .el-button--small {
    padding: 6px 12px;
  }
}

.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
</style>