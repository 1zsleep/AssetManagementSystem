<script setup lang="ts">
import {Refresh, Search} from "@element-plus/icons-vue";
import dayjs from "dayjs";
import {useDebounceFn} from "@vueuse/core";
import {jwtDecode} from "jwt-decode";
import type {JwtPayload, Suppliers} from "~/types";

const detailDialogVisible = ref(false);
const searchValue = ref("");
const pageSize = ref(10);
const currentPage = ref(1);
const total = ref(0);
const tableData = ref<Suppliers[]>([]);
const currentUser = reactive({
  id: -1,
  isAdmin: false,
});
const editMode = ref(false);
const formData = ref<Partial<Suppliers>>({});


const showDetails = (row: Suppliers) => {
  formData.value = {...row};
  detailDialogVisible.value = true;
  editMode.value = false;
};


const getItemList = () => {
  getCurrentUserInfo();
  const params: Record<string, any> = {
    offset: (currentPage.value - 1) * pageSize.value,
    limit: pageSize.value,
  };
  let filter = "status = %黑名单%";
  if (searchValue.value.trim()) {
    filter += `and name like %${searchValue.value}%`;
  }
  if (filter) params.filter = filter;

  http
      .$get("/suppliers", params)
      .then((res) => {
        tableData.value = res.items;
        total.value = res.total;
      })
      .catch((error) => {
        ElMessage.error("获取供应商列表失败");
      });
};

const getCurrentUserInfo = () => {
  try {
    const token = userStore().token;
    if (!token) throw new Error("未获取到用户信息");
    const decoded = jwtDecode<JwtPayload>(token);
    currentUser.id = decoded.id;
    currentUser.isAdmin = decoded.roles.includes("管理员");
    return decoded;
  } catch (error) {
    ElMessage.error("获取用户信息失败");
    throw error;
  }
};


const debouncedSearch = useDebounceFn(getItemList, 500);

onMounted(() => {
  getItemList();
});
</script>

<template>
  <div class="page-container">
    <div class="card-container">
      <div class="toolbar">
        <el-row :gutter="20">
          <el-col :xs="8" :sm="6" :md="4">
          </el-col>
          <el-col :xs="24" :sm="14" :md="18">
            <el-input
                v-model="searchValue"
                placeholder="搜索供应商名称"
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
            backgroundColor: '#f8f9fa',
          }"
        >
          <el-table-column prop="id" label="ID" align="center" width="60"/>
          <el-table-column
              prop="name"
              label="供应商全称"
              header-align="center"
              align="center"
              class-name="uniform-column"
          />
          <el-table-column
              label="状态"
              header-align="center"
              align="center"
              class-name="uniform-column"
          >
            <template #default="{ row }">{{ row.status }}</template>
          </el-table-column>
          <el-table-column
              label="主要联系人"
              header-align="center"
              align="center"
              width="160"
          >
            <template #default="{ row }">{{ row.primaryContact }}</template>
          </el-table-column>
          <el-table-column
              label="开户银行"
              header-align="center"
              align="center"
              width="120"
          >
            <template #default="{ row }">{{ row.bankName }}</template>
          </el-table-column>
          <el-table-column
              label="合作开始日期"
              header-align="center"
              align="center"
              class-name="uniform-column"
          >
            <template #default="{ row }">
              {{ dayjs(row.coopStartDate).format("YYYY-MM-DD") }}
            </template>
          </el-table-column>
          <el-table-column
              label="操作"
              align="center"
              class-name="uniform-column"
              width="180"
          >
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="showDetails(row)">
                查看详情
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
        v-model="detailDialogVisible"
        :title="editMode ? '编辑供应商' : '供应商详情'"
        width="700px"
    >
      <el-form :model="formData" label-width="120px">
        <!-- 基本信息 -->
        <el-form-item label="供应商ID">
          <span v-if="!editMode">{{ formData.id }}</span>
          <el-input v-else v-model="formData.id" disabled/>
        </el-form-item>

        <el-form-item label="全称" prop="name">
          <span>{{ formData.name }}</span>
        </el-form-item>

        <el-form-item label="状态">
          <span>{{ formData.status }}</span>
        </el-form-item>

        <el-form-item label="类型">
          <span>{{ formData.type }}</span>
        </el-form-item>

        <!-- 联系信息 -->
        <el-form-item label="主要联系人">
          <span>{{ formData.primaryContact }}</span>
        </el-form-item>

        <el-form-item label="联系电话">
          <span>{{ formData.phone }}</span>
        </el-form-item>

        <el-form-item label="电子邮箱">
          <span>{{ formData.email }}</span>
        </el-form-item>

        <!-- 地址信息 -->
        <el-form-item label="地区编码">
          <span>{{ formData.regionCode }}</span>
        </el-form-item>

        <el-form-item label="详细地址">
          <span>{{ formData.address }}</span>
        </el-form-item>

        <!-- 财务信息 -->
        <el-form-item label="税号">
          <span>{{ formData.taxNumber }}</span>
        </el-form-item>

        <el-form-item label="开户银行">
          <span>{{ formData.bankName }}</span>
        </el-form-item>

        <el-form-item label="银行账号" prop="bankAccount">
          <span>{{ formData.bankAccount }}</span>
        </el-form-item>

        <!-- 合作信息 -->
        <el-form-item label="发票类型">
        <span>
          {{ formData.invoiceType === 0 ? '普通发票' : '增值税专用发票' }}
        </span>
        </el-form-item>

        <el-form-item label="合作期限">
          <div class="date-range">
            <span>{{ dayjs(formData.startDate).format('YYYY-MM-DD') }}</span>
            <span style="margin: 0 5px">至</span>
            <span>{{ dayjs(formData.endDate).format('YYYY-MM-DD') }}</span>
          </div>
        </el-form-item>

        <!-- 系统信息 -->
        <el-form-item label="评分">
          <el-rate v-model="formData.score" disabled show-score/>
        </el-form-item>

        <el-form-item label="创建人: ">
          <div class="system-info">
            <span>{{ formData.createdBy }}</span>
            <span style="margin-left: 15px">
            时间: {{ dayjs(formData.createdAt).format('YYYY-MM-DD HH:mm') }}
          </span>
          </div>
        </el-form-item>

        <el-form-item label="最后更新人:" v-if="formData.updatedBy">
          <div class="system-info">
            <span> {{ formData.updatedBy }}</span>
            <span style="margin-left: 15px">
            时间: {{ dayjs(formData.updatedAt).format('YYYY-MM-DD HH:mm') }}
          </span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div>
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 保持原有样式不变 */
/* 调整对话框垂直位置 */
:deep(.el-dialog) {
  margin-top: 5vh !important; /* 控制对话框顶部间距 */
}

.page-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.date-range {
  display: flex;
  align-items: center;
}

.system-info {
  color: #666;
  font-size: 0.9em;
}

:deep(.el-form-item__content) {
  line-height: 1.5;
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

:deep(.el-table__header) th {
  background-color: #f8f9fa !important;
}

@media (max-width: 768px) {
  .card-container {
    padding: 15px;
  }
}
</style>