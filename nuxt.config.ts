// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    $development: undefined, $env: undefined, $meta: undefined, $production: undefined, $test: undefined,
    compatibilityDate: '2024-11-01',
    devtools: {enabled: true},
    modules: [
        '@nuxt/icon',
        '@nuxt/image',
        '@vueuse/nuxt',
        'nuxt-icons',
        '@element-plus/nuxt',
        '@pinia/nuxt',
        'pinia-plugin-persistedstate/nuxt',
    ],
    build: {
        transpile: ['@tsparticles/vue3'],
    },
    devServer: {
        port: 3000,
        host: '127.0.0.1'
    },
    //全局参数，用useRuntimeConfig读取
    runtimeConfig: {
        //只在服务端可获取
        isServer: "true",
        public: {
            // 在服务端和客户端都能获取
            baseURL: 'http://127.0.0.1:8080'
        }
    },
    pinia: {
        storesDirs: ['./stores/**', './custom-folder/stores/**'],
    }
})