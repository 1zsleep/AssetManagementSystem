export const useFileManager = (type: Ref<'private' | 'group' | 'public'>) => {
    const pageSize = ref(12)
    const currentPage = ref(1)

    const { data, pending, refresh } = useAsyncData(
        'files',
        async () => {
            const { data } = await http.$get('/assets/files', {
                params: {
                    bucketType: type.value.toUpperCase(),
                    offset: (currentPage.value - 1) * pageSize.value,
                    limit: pageSize.value
                }
            })
            return data
        },
        { watch: [pageSize, currentPage] }
    )

    return { pageSize, currentPage, files: data, loading: pending, refresh }
}