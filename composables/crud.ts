import type {UseFetchOptions} from '#app'; // 使用 type 导入
/**
 *  说明 useFetch 直接访问默认访问页面只在服务端请求一次，客户端端不会重复发起请求，后续客户端可以通过事件进行触发
 */

/**
 * http get 请求
 * @param url
 * @param {Record<string, any>} [params] - 请求查询参数（将自动转换为 URL 参数）
 * @returns {Promise<void>}
 */
export const httpGet = async (url: string, params ?: Record<string, any>): Promise<any> => {
    return await httpRequest(url, {
        method: 'GET',
        params: params
    });
};

export const httpPost = async (url: string, body: Object): Promise<any> => {
    return await httpRequest(url, {
        method: 'POST',
        body: body
    });
};

export const httpPatch = async (url: string, body: Object): Promise<any> => {
    return await httpRequest(url, {
        method: 'PATCH',
        body: body
    });
}
/**
 * 统一请求方法
 * @param url
 * @param options
 * @returns {*}
 */

export const httpRequest = async (url: string, options: UseFetchOptions<any>): Promise<any> => {
    const config = useRuntimeConfig();
    const baseURL = config.public.baseURL;
    return useFetch(url, {
        baseURL: baseURL,
        body: JSON.stringify(options.body),
        params: options.params,
        method: options.method,
        //在请求发送之前执行
        onRequest({request, options}) {
            // Set the request headers
            // note that this relies on ofetch >= 1.4.0 - you may need to refresh your lockfile
            options.headers.set('Authorization', 'Bearer ' + userStore().getToken)
        },
        //当请求失败（例如网络错误、超时等）时触发。
        onRequestError({request, options, error}) {

            // Handle the request errors
        },
        //当响应成功（即状态码在 200 系列范围内）时触发。
        onResponse({request, response, options}) {
            // Process the response data
        },
        //当响应失败（如 4xx、5xx 错误等）时触发。
        onResponseError({request, response, options}) {
            // Handle the response errors
        }
    });
};