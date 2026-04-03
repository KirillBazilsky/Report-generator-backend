import { DailyRecord } from '@prisma/client'
import { prisma } from '../prisma'
import { TPaginationProps, TWithPaginationResponse } from '../types/common'
import { calculatePagination } from '../helpers/paginationCount'
import { transformSearchParams } from '../helpers/transformSearchParams'
import { baseDailyRecordSelector, baseUserSelector, fullDailyRecordSelector, idSelector } from '../helpers/prismaSelectors'

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

  async update(id: number, payload: Partial<DailyRecord>) {
    return await prisma.dailyRecord.update({
      where: {
        id,
      },
      data: payload,
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
      select: baseDailyRecordSelector,
      skip,
      take,
    })

    return {
      data,
      total,
    }
  }

  async getDailyRecordById(id: number) {
    return prisma.dailyRecord.findUnique({
      where: { id },
      select: fullDailyRecordSelector,
    })
  }

  async delete(id: number) {
    return prisma.dailyRecord.delete({
      where: { id },
    })
  }
}
