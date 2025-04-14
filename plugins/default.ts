import VueApexCharts from 'vue3-apexcharts'
export default defineNuxtPlugin(nuxtApp => {
    nuxtApp.vueApp.use(VueApexCharts)
    // Doing something with nuxtApp
    nuxtApp.hook('app:mounted', () => {
        console.log('app mounted --> 客户端页面加载完成')
    })
})
