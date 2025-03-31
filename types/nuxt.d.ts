// types/nuxt.d.ts
import type { NavigationGuard } from 'vue-router'

declare module '#app' {
    interface PageMeta {
        middleware?: string | NavigationGuard | Array<string | NavigationGuard>
    }
}