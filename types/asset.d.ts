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

interface Book {
    bookId: number
    isbn: string
    title: string
    author: string
    publisher: string
    purchaseDate: string
    stockQuantity: number
}

interface Consumable {
    consumableId: number
    name: string
    type: string
    stockQuantity: number
    unit: string
}

interface Equipment {
    equipmentId: number
    name: string
    serialNumber: string
    purchaseDate: number
    status: string
}

interface UserAsset {
    id: number
    userId: number
    assetId: number
    assetType: string
    status: string
    assetName: string
    quantity: number
    acquisitionDate: string
    returnDate: string

}