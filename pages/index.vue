<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 图表配置类型
type ChartConfig = {
  series: any[]
  options: any
}

// 响应式数据
const storageChart = ref<ChartConfig>({
  series: [],
  options: getStorageChartOptions([])
})

const consumablesChart = ref<ChartConfig>({
  series: [],
  options: getConsumablesChartOptions([])
})

const purchaseChart = ref<ChartConfig>({
  series: [],
  options: getPurchaseChartOptions()
})

onMounted(async () => {
  await Promise.all([
    loadStorageData(),
    loadConsumablesData(),
    loadPurchaseData()
  ])
})

// 加载存储数据
async function loadStorageData() {
  try {
    const [publicCount, privateCount, groupsCount] = await Promise.all([
      http.$get('/assets/files/count', { bucketType: 'PUBLIC' }),
      http.$get('/assets/files/count', {  bucketType: 'PRIVATE'}),
      http.$get('/assets/files/count', { bucketType: 'GROUPS' })
    ])

    storageChart.value = {
      series: [publicCount, privateCount, groupsCount],
      options: getStorageChartOptions(['公开', '私有', '群组'])
    }
  } catch (error) {
    console.error('加载存储数据失败:', error)
  }
}

// 加载耗材数据
async function loadConsumablesData() {
  try {
    const data = await http.$get('/consumable/top10')

    consumablesChart.value = {
      series: [{
        name: '消耗量',
        data: data.map((item: any) => item.consumptionStatistics)
      }],
      options: getConsumablesChartOptions(data.map((item: any) => item.name))
    }
  } catch (error) {
    console.error('加载耗材数据失败:', error)
  }
}

// 加载采购数据
async function loadPurchaseData() {
  try {
    const monthlyData = await http.$get('/purchaseOrder/monthlyTotalPrice')

    const sortedData = monthlyData
        .map((item: any) => ({
          x: `${item.year}-${item.month.toString().padStart(2, '0')}`,
          y: item.totalPrice
        }))
        .sort((a: any, b: any) => a.x.localeCompare(b.x))

    purchaseChart.value = {
      series: [{
        name: '采购金额',
        data: sortedData
      }],
      options: getPurchaseChartOptions()
    }
  } catch (error) {
    console.error('加载采购数据失败:', error)
  }
}

// 存储图表配置生成器
function getStorageChartOptions(labels: string[]) {
  return {
    chart: {
      type: 'donut',
      height: 350
    },
    labels,
    legend: {
      position: 'bottom'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: '总数量'
            }
          }
        }
      }
    }
  }
}

// 耗材图表配置生成器
function getConsumablesChartOptions(categories: string[]) {
  return {
    chart: {
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: true
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories,
      title: {
        text: '消耗量'
      }
    },
    yaxis: {
      title: {
        text: '耗材名称'
      }
    }
  }
}

// 采购图表配置生成器
function getPurchaseChartOptions() {
  return {
    chart: {
      type: 'line',
      height: 350,
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth'
    },
    xaxis: {
      type: 'datetime',
      labels: {
        format: 'yyyy-MM'
      }
    },
    yaxis: {
      title: {
        text: '金额 (元)'
      }
    }
  }
}
</script>


<template>
  <div class="dashboard-container p-4 sm:p-6">
    <el-space direction="vertical" :size="24" class="w-full">
      <header>
        <el-text tag="h1" size="small" class="font-bold">
          <el-icon :size="24" class="mr-2"><DataAnalysis /></el-icon>
          资产统计概览
        </el-text>
        <el-text type="info" class="mt-2">数据更新于 {{ new Date().toLocaleDateString() }}</el-text>
      </header>

      <el-row :gutter="20">
        <!-- 存储分布图表 -->
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <el-icon class="mr-2"><PieChart /></el-icon>
                <el-text tag="h3" size="small">存储类型分布</el-text>
              </div>
            </template>
            <apexchart
                :options="storageChart.options"
                :series="storageChart.series"
                width="100%"
                height="320"
            />
          </el-card>
        </el-col>

        <!-- 耗材消耗Top10 -->
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <el-icon class="mr-2"><Histogram /></el-icon>
                <el-text tag="h3" size="small">耗材消耗 Top10</el-text>
              </div>
            </template>
            <apexchart
                :options="consumablesChart.options"
                :series="consumablesChart.series"
                width="100%"
                height="320"
            />
          </el-card>
        </el-col>

        <!-- 月度采购趋势 -->
        <el-col :span="24">
          <el-card class="chart-card mt-4">
            <template #header>
              <div class="card-header">
                <el-icon class="mr-2"><TrendCharts /></el-icon>
                <el-text tag="h3" size="small">月度采购趋势</el-text>
              </div>
            </template>
            <apexchart
                :options="purchaseChart.options"
                :series="purchaseChart.series"
                width="100%"
                height="360"
            />
          </el-card>
        </el-col>
      </el-row>
    </el-space>
  </div>
</template>

<style scoped>
.dashboard-container {
  background-color: var(--el-bg-color-page);
}

.chart-card {
  transition: all 0.3s var(--el-transition-function-fast-bezier);

  :deep(.el-card__header) {
    background-color: var(--el-fill-color-light);
    border-bottom: 1px solid var(--el-border-color-light);
    padding: 16px 24px;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--el-box-shadow-dark);
  }
}

.card-header {
  display: flex;
  align-items: center;
  .el-icon {
    color: var(--el-color-primary);
    font-size: 1.25rem;
  }
}

/* 暗黑模式适配 */
.dark {
  .chart-card {
    :deep(.el-card__header) {
      background-color: var(--el-fill-color-dark);
      border-bottom-color: var(--el-border-color-dark);
    }
  }
}
</style>