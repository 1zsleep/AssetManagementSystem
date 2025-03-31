// composables/useAuth.ts
import { jwtDecode } from 'jwt-decode'

export const useAuth = () => {
    const user = userStore()

    const decoded = computed(() => {
        try {
            return user.token ? jwtDecode<JwtPayload>(user.token) : null
        } catch {
            return null
        }
    })

    const isAdmin = computed(() =>
        decoded.value?.roles?.includes('管理员') || false
    )

    const currentUserId = computed(() => decoded.value?.id)

    return {
        isAdmin,
        currentUserId,
        hasPermission: (requiredRoles: string[]) =>
            requiredRoles.some(role => decoded.value?.roles?.includes(role))
    }
}