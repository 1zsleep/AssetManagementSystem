// 用户组相关类型
export interface UserGroup {
    id: number
    groupName: string
    createdAt: string
    memberCount: number
    createdBy?: {
        id: number
        userName: string
    }
}

export interface GroupMember {
    id: {
        groupId: number
        userId: number
    }
    user: {
        id: number
        userName: string
    }
    createdAt: string
}