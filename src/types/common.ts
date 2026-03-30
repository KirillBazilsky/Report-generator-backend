export type TPaginationProps = {
    page: number
    pageSize: number
}

export type TWithPaginationResponse<T> = {
    data: T;
    total: number
}