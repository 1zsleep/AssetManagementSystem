<script setup lang="ts">

import {Refresh, Search} from "@element-plus/icons-vue";
import dayjs from "dayjs";
import {useDebounceFn} from "@vueuse/core";
import {jwtDecode} from "jwt-decode";
import type {Book, JwtPayload, PurchaseOrder, Suppliers} from "~/types";

const detailVisible = ref(false)
const currentPurchaseOrder = ref<PurchaseOrder>()
const searchValue = ref('')
const pageSize = ref(10)
const currentPage = ref(1)
const total = ref(0)
const tableData = ref<PurchaseOrder[]>([])
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
// 新增部分
const createDialogVisible = ref(false)
const suppliersList = ref<Suppliers[]>([])
const assetTypeOptions = ['BOOK', 'CONSUMABLE', 'EQUIPMENT']
const createForm = reactive({
  supplierId: '',
  assetType: '',
  assetName: '',
  currency: 'CNY',
  quantity: 1,
  unitPrice: 0,
  totalPrice: 0,
  assetAttributes: {} as Record<string, any>,
})

const getItemList = () => {
  getCurrentUserInfo()
  const params: Record<string, any> = {
    offset: (currentPage.value - 1) * pageSize.value,
    limit: pageSize.value
  }
  let filter = 'status == %审核中%'
  if (searchValue.value.trim()) {
    filter += `and assetName like %${searchValue.value}%`
  }
  if (filter) params.filter = filter

  http.$get('/purchaseOrder', params).then(res => {
    console.log(res)
    tableData.value = res.items
    total.value = res.total
  }).catch(error => {
    ElMessage.error('获取单据列表失败')
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
// 获取供应商列表
const fetchSuppliers = async () => {
  try {
    const res = await http.$get('/suppliers')
    suppliersList.value = res.items
  } catch (error) {
    ElMessage.error('获取供应商列表失败')
  }
}

// 打开创建对话框
const openCreateDialog = async () => {
  await fetchSuppliers()
  createDialogVisible.value = true
}

// 监听资产类型变化
watch(() => createForm.assetType, (newVal) => {
  createForm.assetAttributes = {}
})


//通过审核
const approval = (id:number) => {
  http.$patch('/purchaseOrder/approval',id).then(res => {
    ElMessage.success('审批成功')
    getItemList()
  }).catch(error => {
    ElMessage.error('操作失败')
  })
}
//驳回审核
const reject = (id:number) => {
  http.$patch('/purchaseOrder/reject',id).then(res => {
    ElMessage.success('已驳回')
    getItemList()
  }).catch(error => {
    ElMessage.error('操作失败')
  })
}
//查看详情
const re = (id: number) => {
  const params: Record<string, any>={
    offset:0,
    limit:1,
    filter: `id = %${id}%`
  }
  http.$get('/purchaseOrder', params).then(res => {
    currentPurchaseOrder.value = res.items[0]
    detailVisible.value = true
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
// 自动更新资产名称的监听逻辑
watch(() => createForm.assetAttributes, (newVal) => {
  switch (createForm.assetType) {
    case 'BOOK':
      createForm.assetName = newVal.title || ''
      break
    case 'CONSUMABLE':
    case 'EQUIPMENT':
      createForm.assetName = newVal.name || ''
      break
  }
}, { deep: true })
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
                placeholder="搜索单据名称"
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
          <el-table-column prop="assetType" label="资产类型" align="center" width="80"/>
          <el-table-column
              prop="assetName"
              label="资产名字"
              header-align="center"
              align="center"
              width="300"
              class-name="uniform-column"
          />
          <el-table-column label="采购数量" header-align="center" align="center" width="180"  class-name="uniform-column">
            <template #default="{ row }">
              <div class="cell-content">
                {{ row.quantity }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="供应商" header-align="center" align="center" width="190">
            <template #default="{ row }">
              {{ row.supplierName}}
            </template>
          </el-table-column>
          <el-table-column label="状态" header-align="center" align="center" width="180">
            <template #default="{ row }">
              {{ row.status}}
            </template>
          </el-table-column>
          <el-table-column label="采购日期" header-align="center" align="center" class-name="uniform-column">
            <template #default="{ row }">
              <div class="cell-content">
                {{ dayjs(row.purchaseDate).format('YYYY-MM-DD HH:mm') }}
              </div>
            </template>
          </el-table-column>
          <el-table-column  label="操作" align="center" class-name="uniform-column" width="180">
            <template #default="{ row }">
              <el-button   size="small" @click="re(row.id)">
                查看详情
              </el-button>
              <el-button  type="primary" size="small" @click="approval(row.id)">
                通过
              </el-button>
              <el-button  type="danger" size="small" @click="reject(row.id)">
                驳回
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
    <el-dialog
        v-model="detailVisible"
        title="采购单详情"
        width="800px"
    >
      <el-row :gutter="20">
        <!-- 左侧基础信息 -->
        <el-col :span="12">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="采购单ID">
              {{ currentPurchaseOrder?.id }}
            </el-descriptions-item>
            <el-descriptions-item label="供应商">
              {{ currentPurchaseOrder?.supplierName }}
            </el-descriptions-item>
            <el-descriptions-item label="资产类型">
              {{ currentPurchaseOrder?.assetType }}
            </el-descriptions-item>
            <el-descriptions-item label="资产名称">
              {{ currentPurchaseOrder?.assetName }}
            </el-descriptions-item>
            <el-descriptions-item label="单价">
              {{ currentPurchaseOrder?.unitPrice }}
            </el-descriptions-item>
            <el-descriptions-item label="数量">
              {{ currentPurchaseOrder?.quantity }}
            </el-descriptions-item>
            <el-descriptions-item label="总价">
              {{ currentPurchaseOrder?.totalPrice }}
            </el-descriptions-item>
            <el-descriptions-item label="货币">
              {{ currentPurchaseOrder?.currency }}
            </el-descriptions-item>
            <el-descriptions-item label="采购日期">
              {{ dayjs(currentPurchaseOrder?.purchaseDate).format('YYYY-MM-DD HH:mm') }}
            </el-descriptions-item>
          </el-descriptions>
        </el-col>

        <!-- 右侧动态属性 -->
        <el-col :span="12">
          <!-- 书籍信息 -->
          <template v-if="currentPurchaseOrder?.assetType === 'BOOK'">
            <el-descriptions title="图书信息" :column="1" border>
              <el-descriptions-item label="ISBN">
                {{ currentPurchaseOrder?.assetAttributes?.isbn }}
              </el-descriptions-item>
              <el-descriptions-item label="作者">
                {{ currentPurchaseOrder?.assetAttributes?.author }}
              </el-descriptions-item>
              <el-descriptions-item label="出版社">
                {{ currentPurchaseOrder?.assetAttributes?.publisher }}
              </el-descriptions-item>
            </el-descriptions>
          </template>

          <!-- 耗材信息 -->
          <template v-else-if="currentPurchaseOrder?.assetType === 'CONSUMABLE'">
            <el-descriptions title="耗材信息" :column="1" border>
              <el-descriptions-item label="单位">
                {{ currentPurchaseOrder?.assetAttributes?.unit }}
              </el-descriptions-item>
              <el-descriptions-item label="分类">
                {{ currentPurchaseOrder?.assetAttributes?.type }}
              </el-descriptions-item>
            </el-descriptions>
          </template>

          <!-- 设备信息 -->
          <template v-else-if="currentPurchaseOrder?.assetType === 'EQUIPMENT'">
            <el-descriptions title="设备信息" :column="1" border>
              <el-descriptions-item label="序列号">
                {{ currentPurchaseOrder?.assetAttributes?.serialNumber }}
              </el-descriptions-item>
              <el-descriptions-item label="设备状态">
                {{ currentPurchaseOrder?.assetAttributes?.status }}
              </el-descriptions-item>
            </el-descriptions>
          </template>
        </el-col>
      </el-row>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
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