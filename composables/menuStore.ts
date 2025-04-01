// composables/useMenu.ts
import {defineStore} from "pinia";
import {jwtDecode} from "jwt-decode";
import {userStore} from "./userStore";
import type {JwtPayload} from "~/types";

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
    requiredRoles?: string[];
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
                requiredRoles: ['管理员','员工'],
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
            },
            {
                index: '3',
                path: '/assetManagement',
                title: '资产管理',
                icon: 'Management',
                requiredRoles: ['管理员','员工'],
                children: [
                    {
                        index: '3-1',
                        title: '常用物品',
                        path: '/assetManagement/commonUse',
                        exact: true
                    },
                    {
                        index: '3-2',
                        title: '书籍',
                        path: '/assetManagement/Book',
                    },
                    {
                        index: '3-3',
                        title: '耗材',
                        path: '/assetManagement/Consumable',
                    },
                    {
                        index: '3-4',
                        title: '设备',
                        path: '/assetManagement/Equipment',
                    },
                    {
                        index: '3-5',
                        title: userStore().currentRoles.includes('管理员')?"员工资产":"我的资产",
                        path: '/assetManagement/UserAsset'
                    },
                ]
            },
            {
                index:'4',
                path:'/vet',
                title:'审批',
                icon:'Tickets',
                requiredRoles:['管理员'],
                children:[
                    {
                        index: '4-1',
                        title: '资产申请审批',
                        path: '/vet/assetVet'
                    }
                ]
            }
        ] as MenuItem[]
    }),

    actions: {
        // 可以添加菜单更新方法
        updateMenus(newMenus: MenuItem[]) {
            this.allMenus = newMenus;
        },


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

            return state.allMenus
                .filter(menu => {
                    // 主菜单权限校验（满足任意角色即可）
                    const hasMenuAccess = !menu.requiredRoles?.length ||
                        menu.requiredRoles.some(r => this.currentRoles.includes(r));

                    // 同时需要满足：有子菜单或自身有路径
                    const hasValidPath = !!menu.path || (menu.children?.length ?? 0) > 0;

                    return hasMenuAccess && hasValidPath;
                })
                .map(menu => ({
                    ...menu,
                    children: menu.children?.filter(subMenu => {
                        // 子菜单权限校验（逻辑同主菜单）
                        return !subMenu.requiredRoles?.length ||
                            subMenu.requiredRoles.some(r => this.currentRoles.includes(r));
                    })
                }))
                .filter(menu =>
                    // 最终过滤：有有效子菜单或主菜单有独立路径
                    (menu.children?.length ?? 0) > 0 || !!menu.path
                );
        }
    },
});
