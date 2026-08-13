import { prisma } from '../prisma'
import { DailyTask } from '@prisma/client'
import { TPaginationProps, TWithPaginationResponse } from '../types/common'
import { calculatePagination } from '../helpers/paginationCount'
import { transformSearchParams } from '../helpers/transformSearchParams'
import { baseDailyTaskSelector } from '../helpers/prismaSelectors'
import { getSortParams } from '../helpers/getSortParams'
import { buildSearch } from '../helpers/buildSearch'
import { buildWhere } from '../helpers/buildWhere'
import { taskService } from './servicesInit'

export class DailyTaskService {
  async create(recordId: number, taskId: number, taskData: Partial<DailyTask>) {
    const { comment, status } = taskData

    let finalStatus = status

    if (!finalStatus) {
      const lastDailyTask = await prisma.dailyTask.findFirst({
        where: { taskId },
        orderBy: { dailyRecord: { date: 'desc' } },
        select: { status: true },
      })
      finalStatus = lastDailyTask?.status ?? 'IN_PROGRESS'
    }

    taskService.update(taskId, { status: finalStatus })

    return prisma.dailyTask.create({
      data: {
        comment,
        status: finalStatus,
        task: { connect: { id: taskId } },
        dailyRecord: { connect: { id: recordId } },
      },
    })
  }

  async update(
    id: number,
    payload: Partial<Omit<DailyTask, 'id'> & { taskId?: number; dailyRecordId?: number }>
  ) {
    const { taskId, dailyRecordId, ...data } = payload

    if (taskId) {
      taskService.update(taskId, { status: data.status })
    }

    return prisma.dailyTask.update({
      where: {
        id,
      },
      data: {
        ...data,
        ...(taskId && { task: { connect: { id: taskId } } }),
        ...(dailyRecordId && { dailyRecord: { connect: { id: dailyRecordId } } }),
      },
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
    searchParams?: Record<string, string | undefined>
    pagination?: TPaginationProps
  }): Promise<TWithPaginationResponse<DailyTask[]>> {
    const { skip, take } = calculatePagination(payload.pagination)

    const filters = payload.searchParams
      ? transformSearchParams<DailyTask, 'DailyTask'>(payload.searchParams, 'DailyTask')
      : {}
    const search = buildSearch<DailyTask>(payload.searchParams, ['comment'])
    const where = buildWhere<DailyTask>(filters, search)

    const total = await prisma.dailyTask.count({ where })

    const orderBy = getSortParams(payload.searchParams)

    const data = await prisma.dailyTask.findMany({
      where,
      select: baseDailyTaskSelector,
      skip,
      take,
      orderBy,
    })

    return {
      data,
      total,
    }
  }

  async getDailyTaskById(id: number) {
    return prisma.dailyTask.findUnique({
      where: { id },
      select: baseDailyTaskSelector,
    })
  }
}
