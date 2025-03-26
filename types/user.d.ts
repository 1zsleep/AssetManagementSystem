// 用户相关类型
export interface User {
    id: number
    userName: string
    role?: string
    status?: boolean
    createdAt?: string
}

export interface UserOption {
    value: number
    label: string
}

export interface JwtPayload {
    id: number
    roles: string[]
    exp?: number
    status?: boolean
    sub?: string
    [key: string]: any
}