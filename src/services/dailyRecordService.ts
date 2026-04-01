import { DailyRecord } from '@prisma/client'
import { prisma } from '../prisma'
import { TPaginationProps, TWithPaginationResponse } from '../types/common'
import { calculatePagination } from '../helpers/paginationCount'
import { transformSearchParams } from '../helpers/transformSearchParams'

export class DailyRecordService {
  async create(userId: number, date?: string) {
    return await prisma.dailyRecord.create({
      data: {
        date: new Date(date ?? Date.now()),
        user: {
          connect: {
            id: userId,
          },
        },
      },
    })
  }

  async update(id: number, data: Partial<DailyRecord>) {
    return await prisma.dailyRecord.update({
      where: {
        id,
      },
      data,
    })
  }

  async get(payload: {
    searchParams?: Record<string, string | undefined>
    pagination?: TPaginationProps
  }): Promise<TWithPaginationResponse<DailyRecord[]>> {
    const { skip, take } = calculatePagination(payload.pagination)

    const where = payload.searchParams
      ? transformSearchParams<DailyRecord, 'DailyRecord'>(payload.searchParams, 'DailyRecord')
      : {}

    const total = await prisma.dailyRecord.count()

    const data = await prisma.dailyRecord.findMany({
      where,
      include: {
        dailyTasks: true,
        user: true,
        projects: true,
      },
      skip,
      take,
    })

    return {
      data,
      total,
    }
  }

  async delete(id: number) {
    return prisma.dailyRecord.delete({
      where: { id },
    })
  }
}
