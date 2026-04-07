import { Prisma, User } from '@prisma/client'
import { MODEL_FIELD_TYPES } from '../const'

type PrismaModelName = keyof Prisma.TypeMap['model']

const getFieldType = (modelName: string, fieldName: string): string => {
  return MODEL_FIELD_TYPES[modelName]?.[fieldName] || 'string'
}

export const transformSearchParams = <T, M extends PrismaModelName>(
  searchParams: Record<string, string | undefined>,
  modelName: M
): Partial<T> => {
  const result: Partial<T> = {}
  
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    
    const fieldType = getFieldType(modelName, key)
    
    switch (fieldType) {
      case 'number':
        result[key as keyof T] = Number(value) as any
        break
      case 'boolean':
        result[key as keyof T] = (value === 'true') as any
        break
      case 'date':
        const date = new Date(value)

        if (!isNaN(date.getTime())) {
          const year = date.getUTCFullYear()
          const month = date.getUTCMonth()
          const day = date.getUTCDate()

          const startDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
          const endDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999))

          result[key as keyof T] = {
            gte: startDate,
            lte: endDate,
          } as any
        }
        break
      default:
        result[key as keyof T] = value as any
    }
  })
  
  return result
}
