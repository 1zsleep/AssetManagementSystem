// composables/useFile.ts
import type { AssetFile } from '~/types'

export const getFileIcon = (mimeType: string) => {
    const iconMap: Record<string, string> = {
        'image/': 'Picture',
        'video/': 'VideoCamera',
        'application/pdf': 'Document',
        'text/plain': 'Document'
    }

    const [type] = Object.entries(iconMap)
        .find(([key]) => mimeType.startsWith(key)) || []

    return type ? iconMap[type] : 'Document'
}

export const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
}