/**
 * 资源相关类型定义
 * 路径：types/asset.ts
 */
export type Visibility = 'PUBLIC' | 'GROUP' | 'PRIVATE'

interface AssetFile {
    id: number
    fileName: string
    fileType: string
    fileSize: number
    createdAt: string
    thumbnailUrl?: string
    cosKey: string
    previewUrl: string
}
export type FileListViewMode = 'card' | 'list'

export type BucketType = 'PRIVATE' | 'GROUPS' | 'PUBLIC'