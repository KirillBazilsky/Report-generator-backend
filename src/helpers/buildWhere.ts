import { TransformResult } from './transformSearchParams'

export const buildWhere = <T>(
  filters: TransformResult<T>,
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

  if (filters?.ids?.length) {
    AND.push({
      id: {
        in: filters.ids,
      },
    })
  }

  const { ids, ...otherFilters } = filters

  if (filters && Object.keys(otherFilters).length) AND.push(otherFilters)
  if (search && Object.keys(search).length) AND.push(search)

  return AND.length ? { AND } : {}
}
