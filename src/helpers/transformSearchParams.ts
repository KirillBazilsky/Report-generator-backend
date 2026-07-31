import { Prisma, User } from '@prisma/client'
import { MODEL_FIELD_TYPES } from '../const'

type PrismaModelName = keyof Prisma.TypeMap['model']
export type TransformResult<T> = Partial<Omit<T, 'ids'>> & { ids?: number[] }

const getFieldType = (modelName: string, fieldName: string): string => {

  return MODEL_FIELD_TYPES[modelName]?.[fieldName] || 'string'
}

export const transformSearchParams = <T, M extends PrismaModelName>(
  searchParams: Record<string, string | undefined>,
  modelName: M
): TransformResult<T> => {
  const result: TransformResult<T> = {}

  const { search, sortBy, sortOrder, ...params } = searchParams

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return

    const fieldType = getFieldType(modelName, key)

    if (key === 'ids') {
      const ids = value
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id))

      if (ids.length) {
        result.ids = ids
      }

      return
    }

    switch (fieldType) {
      case 'number':
        result[key as keyof TransformResult<T>] = Number(value) as any
        break
      case 'boolean':
        result[key as keyof TransformResult<T>] = (value === 'true') as any
        break
      case 'date':
        const date = new Date(value)

        if (!isNaN(date.getTime())) {
          const year = date.getUTCFullYear()
          const month = date.getUTCMonth()
          const day = date.getUTCDate()

          const startDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
          const endDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999))

          result[key as keyof TransformResult<T>] = {
            gte: startDate,
            lte: endDate,
          } as any
        }
        break
      default:
        result[key as keyof TransformResult<T>] = value as any
    }
  })

  return result
}
