export default defineNuxtPlugin(nuxtApp => {
    // Doing something with nuxtApp
    nuxtApp.hook('app:mounted', () => {
        console.log('app mounted --> 客户端页面加载完成')
    })
})
