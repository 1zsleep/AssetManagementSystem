import {jwtDecode} from "jwt-decode";

export default defineNuxtRouteMiddleware((to,from) => {
    const exclude = ['/login'];
    if (exclude.includes(to.path)){
        return;
    }
    if (import.meta.client){
        const store = userStore();
        const token = store.getToken;
        if (!token) {
            ElMessage.warning('请先登录');
            return navigateTo({ path: '/login' });
        }
        try {
            // 解码并验证token
            const decoded = jwtDecode<{
                exp?: number;
                status?: boolean;
                sub?: string;
            }>(token);

            // 验证过期时间
            if (typeof decoded.exp !== 'number' || decoded.exp * 1000 < Date.now()) {
                handleInvalidToken(store);
                return navigateTo('/login');
            }

            // 验证用户状态
            if (decoded.status === false) {
                store.deleteToken()
                return showError({
                    statusCode: 403,
                    message: '账户已被禁用，请联系管理员'
                })
            }

        } catch (error) {
            console.error('Token解析失败:', error);
            handleInvalidToken(store);
            return navigateTo('/login');
        }
    }
})

// 统一处理无效token
function handleInvalidToken(store: ReturnType<typeof userStore>) {
    store.deleteToken();
    ElMessage.warning('登录凭证已失效，请重新登录');
}