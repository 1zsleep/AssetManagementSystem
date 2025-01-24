export default defineNuxtRouteMiddleware((to,from) => {
    const exclude = ['/login'];
    if (exclude.includes(to.path)){
        return;
    }
    if (import.meta.client){
        const token = useStore().getToken;
        console.log(token);
        if (token == null || token == ''){
            ElMessage.warning('请先登录');
            return navigateTo({path:'/login'});
        }
    }
})
