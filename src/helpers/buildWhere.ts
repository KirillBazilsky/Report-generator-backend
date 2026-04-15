export const buildWhere = <T>(
  filters: Partial<T>,
  search:
    | {
        OR?: undefined
      }
    | {
        OR: {
          [x: string]: {
            contains: string
          }
        }[]
      }
) => {
  const AND = []

  if (filters && Object.keys(filters).length) AND.push(filters)
  if (search && Object.keys(search).length) AND.push(search)

  return AND.length ? { AND } : {}
}

