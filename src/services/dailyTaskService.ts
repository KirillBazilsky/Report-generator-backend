import { prisma } from '../prisma'
import { DailyTask } from '@prisma/client'
import { TPaginationProps, TWithPaginationResponse } from '../types/common'
import { calculatePagination } from '../helpers/paginationCount'
import { transformSearchParams } from '../helpers/transformSearchParams'

export class DailyTaskService {
  async create(recordId: number, taskId: number, taskData: Partial<DailyTask>) {
    const { comment, status } = taskData
    return prisma.dailyTask.create({
      data: {
        comment,
        status: status ?? 'IN_PROGRESS',
        task: {
          connect: {
            id: taskId,
          },
        },
        dailyRecord: {
          connect: {
            id: recordId,
          },
        },
      },
    })
  }

  async update(id: number, taskData: Partial<DailyTask>) {
    return prisma.dailyTask.update({
      where: {
        id,
      },
      data: taskData,
    })
  }

  async delete(id: number) {
    return prisma.dailyTask.delete({
      where: {
        id,
      },
    })
  }

  async get(payload: {
    searchParams?: Record<string, string>
    pagination?: TPaginationProps
  }): Promise<TWithPaginationResponse<DailyTask[]>> {
    const { skip, take } = calculatePagination(payload.pagination)

    const where = payload.searchParams
      ? transformSearchParams<DailyTask, 'DailyTask'>(payload.searchParams, 'DailyTask')
      : {}

    const total = await prisma.dailyTask.count()

    const data = await prisma.dailyTask.findMany({
      where,
      include: {
        dailyRecord: true,
        task: true,
      },
      skip,
      take,
    })

    return {
      data,
      total,
    }
  }
}
