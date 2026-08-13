import { DailyRecord } from '@prisma/client'
import { prisma } from '../prisma'
import { TConnect, TPaginationProps, TWithPaginationResponse } from '../types/common'
import { calculatePagination } from '../helpers/paginationCount'
import { transformSearchParams } from '../helpers/transformSearchParams'
import { baseDailyRecordSelector, fullDailyRecordSelector } from '../helpers/prismaSelectors'
import { getSortParams } from '../helpers/getSortParams'

export class DailyRecordService {
  async create(userId: number, date?: string) {
    const normalizedDate = this.normalizeToUTCDate(date ? new Date(date) : new Date())

    const existingRecord = await prisma.dailyRecord.findUnique({
      where: {
        userId_date: {
          userId: userId,
          date: normalizedDate,
        },
      },
    })

    if (existingRecord) {
      const dateStr = normalizedDate.toISOString().split('T')[0]
      throw new Error(`Daily record for date ${dateStr} already exists`)
    }

    return await prisma.dailyRecord.create({
      data: {
        date: normalizedDate,
        userId: userId,
      },
      include: {
        user: true,
        dailyTasks: true,
        projects: true,
      },
    })
  }

  async update(
    id: number,
    payload: Partial<DailyRecord & { projects: TConnect[]; dailyTasks: TConnect[] }>
  ) {
    const { projects, dailyTasks, userId, ...data } = payload

    return await prisma.dailyRecord.update({
      where: {
        id,
      },
      data: {
        ...data,
        ...(projects && { projects: { set: projects.map((project) => ({ id: project.id })) } }),
        ...(dailyTasks && {
          dailyTasks: { set: dailyTasks.map((dailyTask) => ({ id: dailyTask.id })) },
        }),
      },
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

    const total = await prisma.dailyRecord.count({ where })

    const orderBy = getSortParams(payload.searchParams)

    const data = await prisma.dailyRecord.findMany({
      where,
      select: baseDailyRecordSelector,
      skip,
      take,
      orderBy,
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
    await prisma.dailyTask.deleteMany({
      where: { dailyRecordId: id },
    })

    return prisma.dailyRecord.delete({
      where: { id },
    })
  }

  private normalizeToUTCDate(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0)
    )
  }

  async getDates(id: number) {
    const datesOnly = await prisma.dailyRecord.findMany({
      where: {
        userId: id,
      },
      select: {
        date: true,
      },
    })

    return datesOnly.map((date) => date.date)
  }

  async getDatesWithTasks(userId: number, monthDate: string): Promise<Date[]> {
  const normalizedMonthDate = this.normalizeToUTCDate(monthDate ? new Date(monthDate) : new Date())

  const startOfMonth = new Date(
    normalizedMonthDate.getFullYear(),
    normalizedMonthDate.getMonth(),
    1
  )
  const endOfMonth = new Date(
    normalizedMonthDate.getFullYear(),
    normalizedMonthDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  )

  const dailyRecords = await prisma.dailyRecord.findMany({
    where: {
      userId: userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      dailyTasks: {
        some: {}
      }
    },
    select: {
      date: true,
    }
  });

  return dailyRecords.map(record => record.date);
}
}
