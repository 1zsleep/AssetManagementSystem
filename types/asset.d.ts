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
    description: string
}

interface Consumable {
    consumableId: number
    name: string
    type: string
    supplier: string
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
interface PurchaseOrder {
    id: number
    assetType: string
    assetName: string
    purchaseDate: string
    quantity: number
    unitPrice: number
    totalPrice: number
    status: string
    supplier: string
    currency: string
    archiveDate: string
}

interface Suppliers {
    id: number
    name: string
    shortName: string
    status: string
    type: string
    primaryContact: string
    phone: string
    email: string
    address: string
    regionCode: string
    taxNumber: string
    bankName: string
    bankAccount: string
    invoiceType: number
    startDate: string
    endDate: string
    score: number
    createdBy: string
    updatedBy: string
    createdAt: string
    updatedAt: string
}