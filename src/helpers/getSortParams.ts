export const getSortParams = <T extends Record<string, any>>(
  searchParams?: Record<string, string | string[] | undefined>,
  allowedFields?: Array<keyof T>
) => {
  const rawSortBy = searchParams?.sortBy
  const rawSortOrder = searchParams?.sortOrder

  const sortOrder: 'asc' | 'desc' =
    rawSortOrder === 'asc' || rawSortOrder === 'desc' ? rawSortOrder : 'desc'

  if (!rawSortBy) {
    return { id: 'desc' } as const
  }

  const normalizeField = (field: string): keyof T | null => {
    if (!allowedFields) return field as keyof T
    return allowedFields.includes(field as keyof T) ? (field as keyof T) : null
  }

  if (!Array.isArray(rawSortBy)) {
    const field = normalizeField(rawSortBy)
    if (!field) return { id: 'desc' } as const

    return { [field]: sortOrder }
  }

  const result = rawSortBy
    .map((field) => normalizeField(field))
    .filter(Boolean)
    .map((field) => ({
      [field as keyof T]: sortOrder,
    }))

  if (result.length === 0) {
    return { id: 'desc' } as const
  }

  return result
}
