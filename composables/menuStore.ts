// composables/useMenu.ts
import {defineStore} from "pinia";
import {jwtDecode} from "jwt-decode";
import {userStore} from "./userStore";

export interface MenuItem {
    index: string;
    title: string;
    icon: string;
    path: string;
    requiredRoles?: string[];
    children?: SubMenuItem[];
    popperClass?: string;
}

export interface SubMenuItem {
    index: string;
    title: string;
    path: string;
    exact?: boolean;
}

export interface JwtPayload {
    id: any;
    roles?: string[];

    [key: string]: any;
}

export const menuStore = defineStore('menuStore', {
    state: () => ({
        role: '',
        allMenus: [
            {
                index: '1',
                path: '/userManagement',
                title: '用户管理',
                icon: 'User',
                requiredRoles: ['管理员'],
                children: [
                    {
                        index: '1-1',
                        title: '用户列表',
                        path: '/userManagement/userList',
                        exact: true
                    },
                    {
                        index: '1-2',
                        title: '用户组',
                        path: '/userManagement/groups',
                        exact: true
                    }
                ]
            },
            {
                index: '2',
                path: '/fileManagement',
                title: '文件管理',
                icon: 'Files',
                requiredRoles: ['管理员'],
                children: [
                    {
                        index: '2-1',
                        title: '我的资源',
                        path: '/fileManagement/private',
                        exact: true
                    },
                    {
                        index: '2-2',
                        title: '群组资源',
                        path: '/fileManagement/group',
                        exact: true
                    },
                    {
                        index: '2-3',
                        title: '公共资源',
                        path: '/fileManagement/public',
                        exact: true
                    }
                ]
            }
        ] as MenuItem[]
    }),

    actions: {
        // 可以添加菜单更新方法
        updateMenus(newMenus: MenuItem[]) {
            this.allMenus = newMenus;
        }
    },

    getters: {
        // 当前用户权限
        currentRoles(): string[] {
            const user = userStore();
            try {
                if (!user.getToken) return [];
                const decoded = jwtDecode<JwtPayload>(user.getToken);
                this.role = decoded.role;
                return decoded.roles || [];
            } catch (e) {
                return [];
            }
        },

        // 过滤后的菜单
        filteredMenus(state): MenuItem[] {
            return state.allMenus.filter(menu => {
                if (!menu.requiredRoles || menu.requiredRoles.length === 0) return true;
                return menu.requiredRoles.some(role => this.currentRoles.includes(role));
            });
        }
    },
});
