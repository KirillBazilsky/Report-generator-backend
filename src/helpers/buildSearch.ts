export const buildSearch = <T>(
  searchParams?: Record<string, string | undefined>,
  fields: string[] = []
) => {
  const search = searchParams?.search

  if (!search || !fields.length) return {}

  const OR = fields.filter(Boolean).map((field) => ({
    [field]: {
      contains: search,
      mode: 'insensitive',
    },
  }))

  return OR.length ? { OR } : {} 
}
