import {defineStore} from "pinia";


export const useStore = defineStore('storeId', {
    state: () => ({
        count: 9,
        token: '',
    }),
    actions: {
        setToken(token: string) {
            this.token = token;
        },
        deleteToken() {
            this.token = '';
        },
        increment() {
            this.updateData(++this.count)
        },
        decrement() {
            this.updateData(--this.count)
        },
        updateData(newData: number) {
            this.count = newData;

        },
        initStorageListener() {
            // 监听 localStorage 变化
            if (import.meta.client) {
                window.addEventListener('storage', (event) => {
                    if (event.key === 'storeId') {// storeId是你的store标识符
                        if (event.newValue !== null) {
                            const newValue = JSON.parse(event.newValue)
                            console.log(newValue)
                            if (newValue && newValue.count) {
                                this.count = newValue.count
                                this.token = newValue.token
                            }
                            console.log(this.count)
                        }

                    }
                })
            }
        },
    },
    getters: {
        doubleCount(state) {
            return state.count * 2
        },
        getToken(state) {
            return state.token
        }
    },
    persist :{
        storage : import.meta.client ? piniaPluginPersistedstate.localStorage() : piniaPluginPersistedstate.cookies()
    }
})
