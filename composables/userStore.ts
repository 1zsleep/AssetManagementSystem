import {defineStore} from "pinia";

export const userStore = defineStore('storeId', {
    state: () => ({
        token: '',
    }),
    actions: {
        login(username: string, password: string){
            httpPost('/auth/login',{
                userName: username,
                userPassword: password
            }).then(
                (res) => {
                    console.log(res);
                    if(res.status._rawValue === 'success'){
                        console.log(res.data._rawValue.data)
                        this.token=(res.data._rawValue.data);
                        ElMessage.success('登录成功');
                        navigateTo('/');
                    }else {
                        ElMessage.error('账号或密码错误')
                    }
                }
            )
        },
        setToken(token: string) {
            this.token = token;
        },
        deleteToken() {
            this.token = '';
            this.$persist();
        },
    },
    getters: {
        isLoggedIn: (state) => !!state.token,
        getToken(state) {
            return state.token
        },
    },
    persist :{
        storage : import.meta.client ? piniaPluginPersistedstate.localStorage() : piniaPluginPersistedstate.cookies()
    }
})
