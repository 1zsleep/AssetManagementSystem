// ~/composables/http.ts
import type {FetchOptions} from 'ofetch'
import type {UseFetchOptions} from '#app'

interface HttpInterceptor {
    onRequest?: (ctx: { options: FetchOptions }) => void
    onRequestError?: (ctx: { error: Error }) => void
    onResponse?: (ctx: { response: any }) => void
    onResponseError?: (ctx: { error: Error }) => void
}

const createHttpClient = (baseURL: string) => {
    const interceptors: HttpInterceptor = {}

    return {
        addInterceptor(interceptor: HttpInterceptor) {
            Object.assign(interceptors, interceptor)
        },

        // useFetch 版本
        useRequest(
            url: string,
            options: UseFetchOptions<any>,
        ) {
            return useFetch(url, {
                baseURL: baseURL,
                body: JSON.stringify(options.body),
                params: options.params,
                method: options.method,
                //在请求发送之前执行
                onRequest(context) {
                    interceptors.onRequest?.({options: context.options})
                },
                onRequestError(context) {
                    if (context.error) {
                        interceptors.onRequestError?.({error: context.error})
                    }
                },
                onResponse(context) {

                    return interceptors.onResponse?.(context) || context.response._data
                },
                onResponseError(context) {
                    if (context.error) {
                        interceptors.onResponseError?.({error: context.error})
                    }
                }
            })
        },

        // $fetch 版本
        async $request(
            url: string,
            options: UseFetchOptions<any>,
        ): Promise<any> {
            try {
                return await $fetch<any>(url, {
                    baseURL: baseURL,
                    body: JSON.stringify(options.body),
                    params: options.params,
                    method: unref(options.method),
                    onRequest(context) {
                        interceptors.onRequest?.({options: context.options})
                    },
                    onRequestError(context) {
                        if (context.error) {
                            interceptors.onRequestError?.({error: context.error})
                        }
                    },
                    onResponse(context) {
                        return interceptors.onResponse?.(context) || context.response._data
                    },
                    onResponseError(context) {
                        if (context.error) {
                            interceptors.onResponseError?.({error: context.error})
                        }
                    }
                })
            } catch (error) {
                throw error
            }
        }
    }
}

// 创建实例
const httpInstance = createHttpClient(useRuntimeConfig().public.baseURL)

// 添加全局拦截器
httpInstance.addInterceptor({
    onRequest({options}) {
        options.headers = {
            ...options.headers,
            Authorization: `Bearer ${userStore().token}`
        }
    },
    onRequestError({error}) {
        console.error('请求失败:', error)
    },
    onResponse({response}) {
        if (response.status !== 200) {
            throw new Error(response._data?.message || '未知错误')
        }
        return response._data
    },
    onResponseError({error}) {
        console.error('响应错误:', error)
        throw error
    }
})

// 导出方法
export const http = {
    // useFetch 方法
    useGet: (url: string, params?: Record<string, any>): Promise<any> =>
        httpInstance.useRequest(url, {
            method: 'GET',
            params: params
        }),

    usePost: (url: string, body?: object): Promise<any> =>
        httpInstance.useRequest(url, {
            body: body,
            method: 'POST',
        }),

    usePut: (url: string, body?: object): Promise<any> =>
        httpInstance.useRequest(url, {
            method: 'PUT',
            body: body,
        }),

    usePatch: (url: string, body?: object): Promise<any> =>
        httpInstance.useRequest(url, {
            method: 'PATCH',
            body: body,
        }),

    useDelete: (url: string, params?: Record<string, any>): Promise<any> =>
        httpInstance.useRequest(url, {
            method: 'DELETE',
            params: params
        }),

    // $fetch 方法
    $get: (url: string, params?: Record<string, any>): Promise<any> =>
        httpInstance.$request(url, {
            method: 'GET',
            params: params
        }),

    $post: (url: string, body?: object, params?: Record<string, any>): Promise<any> =>
        httpInstance.$request(url, {
            body: body,
            method: 'POST',
            params: params
        }),

    $put: (url: string, body?: object): Promise<any> =>
        httpInstance.$request(url, {
            method: 'PUT',
            body: body,
        }),

    $patch: (url: string, body?: object): Promise<any> =>
        httpInstance.$request(url, {
            method: 'PATCH',
            body: body,
        }),

    $delete: (url: string, params?: Record<string, any>): Promise<any> =>
        httpInstance.$request(url, {
            method: 'DELETE',
            params: params
        })
}
