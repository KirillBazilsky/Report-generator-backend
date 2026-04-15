export const buildWhere = <T>(filters: Partial<T>, search: Partial<T>) => {
  return {
    AND: [filters, search],
  }
}
