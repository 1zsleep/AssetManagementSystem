<script setup lang="ts">
import { Plus, Refresh, Search, Close } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDebounceFn } from '@vueuse/core'
import dayjs from 'dayjs'
import {jwtDecode} from "jwt-decode";

// 类型定义------------------------------------------------
import type {UserGroup, GroupMember, UserOption, JwtPayload, User} from '~/types'


// 响应式状态----------------------------------------------
const searchValue = ref('')
const pageSize = ref(10)
const currentPage = ref(1)
const total = ref(0)
const tableData = ref<UserGroup[]>([])
const dialogVisible = ref(false)
const editDialogVisible = ref(false)
const form = reactive({
  groupName: '',
  userIds: [] as number[]
})
const userOptions = ref<UserOption[]>([])
const currentGroupId = ref<number>()
const members = ref<Array<{groupId: number, userId: number, userName: string}>>([])
const editForm = reactive({
  originalGroupName: '',
  groupName: '',
  selectedUserIds: [] as number[],
  isSubmitting: false
})

const currentUser = reactive({
  id: -1,
  isAdmin: false
})

// 计算属性------------------------------------------------
const combinedUserOptions = computed(() => {
  const memberMap = new Map(members.value.map(m => [m.userId, m.userName]))
  return [
    ...Array.from(memberMap, ([userId, userName]) => ({
      value: userId,
      label: userName
    })),
    ...userOptions.value.filter(u => !memberMap.has(u.value))
  ]
})

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

const handleError = (error: unknown, defaultMsg: string) => {
  const err = error as any
  ElMessage.error(err.response?.data?.message || err.message || defaultMsg)
}

const getUserName = (userId: number) => {
  const member = members.value.find(m => m.userId === userId)
  if (member) return member.userName

  const user = userOptions.value.find(u => u.value === userId)
  return user?.label || '未知用户'
}

// 核心业务逻辑-------------------------------------------
const getGroupList = async () => {
  try {
    // 先获取用户信息（关键修改）
    await getCurrentUserInfo()

    const params: Record<string, any> = {
      offset: (currentPage.value - 1) * pageSize.value,
      limit: pageSize.value
    }

    // 构建过滤条件（关键修改）
    let filter = ''
    if (!currentUser.isAdmin) {
      filter = `members.userId eq ${currentUser.id}`
      if (searchValue.value.trim()) {
        filter += ` and groupName like %${searchValue.value}%`
      }
    } else if (searchValue.value.trim()) {
      filter = `groupName like %${searchValue.value}%`
    }

    if (filter) params.filter = filter

    const res = await http.$get('/groups', params) as { data: { items: UserGroup[], total: number } }
    tableData.value = res.data.items
    total.value = res.data.total
  } catch (error) {
    handleError(error, '获取用户组列表失败')
  }
}

const createGroup = async () => {
  if (!form.groupName) {
    ElMessage.warning('请填写组名称')
    return
  }

  try {
    const creatorId = (await getCurrentUserInfo()).id
    const groupRes = await http.$post('/groups', {
      groupName: form.groupName,
      creatorId
    }) as { data: { id: number } }

    const memberIds = Array.from(new Set([creatorId, ...form.userIds]))
    await http.$post(`/groups/${groupRes.data.id}/members/batch`, memberIds)

    ElMessage.success('创建成功')
    dialogVisible.value = false
    form.userIds = []
    await getGroupList()
  } catch (error) {
    handleError(error, '创建失败')
  }
}

const deleteGroup = (groupId: number) => {
  ElMessageBox.confirm('确定删除该用户组？删除后无法恢复', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await http.$delete(`/groups/${groupId}`, {
        params: { operatorId: (await getCurrentUserInfo()).id }
      })
      ElMessage.success('删除成功')
      await getGroupList()
    } catch (error) {
      handleError(error, '删除失败')
    }
  }).catch(() => {})
}

const openEditDialog = async (groupId: number) => {
  try {
    currentGroupId.value = groupId

    const groupRes = await http.$get(`/groups/${groupId}`) as { data: UserGroup }
    editForm.originalGroupName = groupRes.data.groupName
    editForm.groupName = groupRes.data.groupName

    const membersRes = await http.$get(`/groups/${groupId}/members`, {
      limit: 1000
    }) as { data: { items: GroupMember[] } }

    members.value = membersRes.data.items.map(m => ({
      groupId: m.id.groupId,
      userId: m.id.userId,
      userName: m.user.userName
    }))

    editForm.selectedUserIds = members.value
        .map(m => m.userId)
        .filter(v => typeof v === 'number')

    editDialogVisible.value = true
  } catch (error) {
    handleError(error, '获取组信息失败')
  }
}

const submitEdit = async () => {
  if (!currentGroupId.value) return

  try {
    editForm.isSubmitting = true

    if (editForm.groupName !== editForm.originalGroupName) {
      await http.$put(`/groups/${currentGroupId.value}/name`, {
        newName: editForm.groupName,
        currentUserId: (await getCurrentUserInfo()).id
      })
    }

    const originalIds = members.value.map(m => m.userId)
    const newIds = editForm.selectedUserIds
    const addIds = newIds.filter(id => !originalIds.includes(id))
    const removeIds = originalIds.filter(id => !newIds.includes(id))

    if (addIds.length > 0) {
      await http.$post(`/groups/${currentGroupId.value}/members/batch`, addIds)
    }

    if (removeIds.length > 0) {
      await Promise.all(
          removeIds.map(userId =>
              http.$delete(`/groups/${currentGroupId.value}/members/${userId}`)
          )
      )
    }

    ElMessage.success('修改成功')
    editDialogVisible.value = false
    await getGroupList()
  } catch (error) {
    handleError(error, '修改失败')
  } finally {
    editForm.isSubmitting = false
  }
}

const loadUserOptions = async () => {
  try {
    const res = await http.$get('/users/list', {
      limit: 1000,
      fields: 'id,userName'
    }) as { items: User[] }

    userOptions.value = res.items.map(user => ({
      value: user.id,
      label: user.userName
    }))
  } catch (error) {
    handleError(error, '加载用户列表失败')
  }
}

// 生命周期-----------------------------------------------
onMounted(async () => {
  await getCurrentUserInfo() // 优先初始化用户信息
  await getGroupList()
  await loadUserOptions()
})

const debouncedSearch = useDebounceFn(getGroupList, 500)
</script>
<template>
  <div class="page-container">
    <div class="card-container">
      <div class="toolbar">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="6" :md="4">
            <el-button type="primary" :icon="Plus" @click="dialogVisible = true">
              新建用户组
            </el-button>
          </el-col>

          <el-col :xs="24" :sm="14" :md="18">
            <el-input
                v-model="searchValue"
                placeholder="搜索用户组名称"
                clearable
                @input="debouncedSearch"
                @clear="getGroupList"
            >
              <template #append>
                <el-button :icon="Search" @click="getGroupList" />
              </template>
            </el-input>
          </el-col>

          <el-col :xs="24" :sm="4" :md="2">
            <el-tooltip content="刷新">
              <el-button :icon="Refresh" circle @click="getGroupList" />
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
          <el-table-column prop="id" label="ID" align="center" width="80" />
          <el-table-column
              prop="groupName"
              label="组名称"
              header-align="center"
              align="center"
              class-name="uniform-column"
          />
          <el-table-column label="创建人" header-align="center" align="center" class-name="uniform-column">
            <template #default="{ row }">
              <div class="cell-content">
                {{ row.createdBy?.userName || '-' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="成员数量" header-align="center" align="center" width="120">
            <template #default="{ row }">
              {{ row.memberCount || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" header-align="center" align="center" class-name="uniform-column">
            <template #default="{ row }">
              <div class="cell-content">
                {{ dayjs(row.createdAt).format('YYYY-MM-DD HH:mm') }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="uniform-column" width="180">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="openEditDialog(row.id)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="deleteGroup(row.id)">
                删除
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
            @size-change="getGroupList"
            @current-change="getGroupList"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="新建用户组" width="600px" center>
      <el-form :model="form" label-width="80px">
        <el-form-item label="组名称" required>
          <el-input
              v-model="form.groupName"
              placeholder="请输入组名称"
              maxlength="20"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="添加成员">
          <el-select
              v-model="form.userIds"
              multiple
              filterable
              placeholder="选择要添加的成员（可选）"
              style="width: 100%"
          >
            <el-option
                v-for="user in userOptions"
                :key="user.value"
                :label="user.label"
                :value="user.value"
            />
          </el-select>
          <div class="form-tip">
            当前登录用户将自动成为创建人，
            <span v-if="form.userIds.length === 0">默认不添加其他成员</span>
            <span v-else>已添加 {{ form.userIds.length }} 个成员</span>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="createGroup">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" title="编辑用户组" width="600px" center>
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="组名称" required>
          <el-input
              v-model="editForm.groupName"
              placeholder="请输入新组名"
              maxlength="20"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="组成员" required>
          <el-select
              v-model="editForm.selectedUserIds"
              multiple
              filterable
              placeholder="选择组成员"
              style="width: 100%"
          >
            <el-option
                v-for="user in combinedUserOptions"
                :key="user.value"
                :label="user.label"
                :value="user.value"
            />
          </el-select>
          <div class="form-tip">
            已选 {{ editForm.selectedUserIds.length }} 个成员：
            <template v-if="editForm.selectedUserIds.length > 0">
              <span
                  v-for="(id, index) in editForm.selectedUserIds"
                  :key="index"
                  class="selected-user"
              >
                {{ getUserName(id) }}
                <el-tooltip content="移除">
                  <el-icon
                      class="remove-icon"
                      @click="editForm.selectedUserIds = editForm.selectedUserIds.filter((_,i) => i !== index)"
                  >
                    <Close />
                  </el-icon>
                </el-tooltip>
              </span>
            </template>
            <span v-else class="empty-tip">暂无选择成员</span>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button
              type="primary"
              :loading="editForm.isSubmitting"
              @click="submitEdit"
          >
            确 定
          </el-button>
        </div>
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
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
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
  background: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
</style>