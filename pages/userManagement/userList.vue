<!-- pages/userManagement/userList.vue -->
<script setup lang="ts">
import {ArrowDown, Plus, Refresh, Search} from "@element-plus/icons-vue";
import {useDebounceFn} from '@vueuse/core'

const searchField = ref('username')
const searchValue = ref('')
const pageSize = ref(10)
const currentPage = ref(1)
const total = ref(0)
const tableData = ref([])
const centerDialogVisible = ref(false)
const selectedUsers = ref<any[]>([])
const form = reactive({
  username: "",
  password: "123456",
  role: "STAFF",
  status: '1',
})
const rules = reactive({
  username: [
    {required: true, message: '用户名不能为空', trigger: 'blur'},
  ]
})

// 批量操作统一处理
const batchOperation = (action: 'delete' | 'enable' | 'disable') => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择要操作的用户')
    return
  }

  const validUsers = selectedUsers.value.filter(user => user.id !== 1)
  if (validUsers.length === 0) {
    ElMessage.warning('选中的用户包含不可操作的管理员')
    return
  }
  const ids = validUsers.map(u => u.id)
  const actionMap = {
    delete: {
      title: '删除',
      api: () => http.$delete("/users/batch-delete", {ids}),
      success: '删除'
    },
    enable: {
      title: '启用',
      api: () => http.$post("/users/batch-status", {ids, status: true}),
      success: '启用'
    },
    disable: {
      title: '禁用',
      api: () => http.$post("/users/batch-status", {ids, status: false}),
      success: '禁用'
    }
  }

  ElMessageBox.confirm(`确定要${actionMap[action].title}选中的用户吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await actionMap[action].api()
      ElMessage.success(`成功${actionMap[action].success}${res.data}个用户`)
      selectedUsers.value = []
      await getUserList()
    } catch {
      ElMessage.error('操作失败')
    }
  }).catch(() => {
  })
}

const getUserList = async () => {
  try {
    const offset = (currentPage.value - 1) * pageSize.value
    const limit = pageSize.value
    const filter = searchValue.value.trim()
        ? `${searchField.value} like %${searchValue.value.trim()}%`
        : ''

    const response = await http.$get("/users/list", {
      offset,
      limit,
      filter
    })
    tableData.value = response.items
    total.value = response.total
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  }
}

const updateUser = (row: any) => {
  http.$patch("/users", row).then(() => {
    getUserList()
  })
}

const newUser = async (show: boolean) => {
  if (form.username === '') {
    ElMessage.warning("用户名不能为空")
    return
  }

  try {
    await http.$post("/users/register", {
      userName: form.username,
      userPassword: form.password === '' ? "123456" : form.password,
      role: form.role === '' ? 'STAFF' : form.role,
      status: (form.status === '' || form.status === '1'),
    })
    ElMessage.success("添加成功")
    centerDialogVisible.value = show
    await getUserList()
  } catch (err:any) {
    ElMessage.error(err.message)
  }
}

const deleteUser = (row: any) => {
  http.$delete(`/users/${row.id}`).then(() => {
    getUserList()
  })
}

// 防抖搜索
const debouncedSearch = useDebounceFn(getUserList, 500)

onMounted(() => {
  getUserList()
})
</script>

<template>
  <div class="page-container">
    <div class="card-container">
      <!-- 工具栏 -->
      <div class="toolbar">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="6" :md="4" :lg="3">
            <el-button type="primary" :icon="Plus" @click="centerDialogVisible = true">
              添加用户
            </el-button>
          </el-col>

          <el-col :xs="24" :sm="6" :md="4" :lg="4">
            <el-dropdown>
              <el-button type="primary">
                批量操作
                <el-icon>
                  <arrow-down/>
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="batchOperation('delete')">批量删除</el-dropdown-item>
                  <el-dropdown-item @click="batchOperation('enable')">批量启用</el-dropdown-item>
                  <el-dropdown-item @click="batchOperation('disable')">批量禁用</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-col>

          <el-col :xs="24" :sm="12" :md="14" :lg="14">
            <el-input
                v-model="searchValue"
                placeholder="请输入搜索内容"
                clearable
                @input="debouncedSearch"
                @clear="getUserList"
            >
              <template #prepend>
                <el-select
                    v-model="searchField"
                    style="width: 115px"
                    @change="getUserList"
                >
                  <el-option label="用户名" value="username"/>
                  <el-option label="用户ID" value="id"/>
                  <el-option label="状态" value="status"/>
                </el-select>
              </template>
              <template #append>
                <el-button :icon="Search" @click="getUserList"/>
              </template>
            </el-input>
          </el-col>

          <el-col :xs="24" :sm="4" :md="2" :lg="3">
            <el-tooltip content="刷新">
              <el-button
                  :icon="Refresh"
                  circle
                  @click="getUserList"
              />
            </el-tooltip>
          </el-col>
        </el-row>
      </div>

      <!-- 表格区域 -->
      <div class="table-section">
        <el-table
            :data="tableData"
            @selection-change="val => selectedUsers = val"
        >
          <el-table-column type="selection" width="55"/>
          <el-table-column prop="id" label="ID" width="100"/>
          <el-table-column prop="userName" label="用户名" min-width="150"/>
          <el-table-column prop="role" label="角色" width="120"/>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="scope">
              <el-switch
                  v-model="scope.row.status"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  :validate-event="false"
                  @change="updateUser(scope.row)"
                  :disabled="scope.row.id === 1"
              />
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180"/>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button size="small">Edit</el-button>
              <el-button
                  size="small"
                  type="danger"
                  @click="deleteUser(scope.row)"
                  :disabled="scope.row.id === 1"
              >
                Delete
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 15, 20, 30]"
            :background="true"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="getUserList"
            @current-change="getUserList"
        />
      </div>
    </div>

    <!-- 添加用户对话框 -->
    <el-dialog
        v-model="centerDialogVisible"
        title="创建用户"
        width="500"
        center
        draggable
    >
      <el-form :model="form" size="large" :rules="rules">
        <el-form-item label="用户名" label-width="100px" required prop="username">
          <el-input v-model="form.username" autocomplete="off"/>
        </el-form-item>
        <el-form-item label="密码" label-width="100px">
          <el-input v-model="form.password" autocomplete="off"/>
        </el-form-item>
        <el-form-item label="角色" label-width="100px">
          <el-select v-model="form.role" placeholder="请选择">
            <el-option label="管理员" value="ADMIN"/>
            <el-option label="员工" value="STAFF"/>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" label-width="100px">
          <el-select v-model="form.status" placeholder="请选择">
            <el-option label="启用" value="1"/>
            <el-option label="禁用" value="0"/>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="centerDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="newUser(false)">提交</el-button>
          <el-button type="success" @click="newUser(true)">保存并继续添加</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
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

.el-table {
  width: 100%;
  --el-table-border-color: #ebeef5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .el-col {
    margin-bottom: 12px;
  }

  .el-button--large {
    width: 100%;
  }
}
</style>