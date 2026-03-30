import { DEFAULT_PAGINATION } from '../const';
import { TPaginationProps } from '../types/common'

export const calculatePagination = (
  paginationProps?: TPaginationProps,
): { take: number; skip: number } => {

    if(!paginationProps) {
        return DEFAULT_PAGINATION
    }

  const { page, pageSize } = paginationProps

  return { take: pageSize, skip: pageSize * (page - 1) }
}
