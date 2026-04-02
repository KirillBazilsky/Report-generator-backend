import { Task } from '@prisma/client'
import { prisma } from '../prisma'
import { TPaginationProps, TWithPaginationResponse } from '../types/common'
import { calculatePagination } from '../helpers/paginationCount'
import { transformSearchParams } from '../helpers/transformSearchParams'
import { idSelector, nameSelector, nickNameSelector } from '../helpers/prismaSelectors'

export class TaskService {
  async create(
    userId: number,
    name: string,
    projectId: number,
    description?: string,
    startDate?: string
  ) {
    return prisma.task.create({
      data: {
        name: name,
        description: description,
        startDate: new Date(startDate ?? Date.now()),
        user: {
          connect: {
            id: userId,
          },
        },
        project: {
          connect: {
            id: projectId,
          },
        },
      },
    })
  }

  async update(id: number, data: Partial<Task>) {
    const isTaskEnded = data.status === 'DONE' || data.status === 'CLOSED'

    if (isTaskEnded) {
      prisma.task.update({
        where: {
          id: id,
        },
        data: {
          endDate: new Date(Date.now()),
        },
      })
    }

    return prisma.task.update({
      where: {
        id: id,
      },
      data: data,
    })
  }

  async get(payload: {
    searchParams?: Record<string, string | undefined>
    pagination?: TPaginationProps
  }): Promise<TWithPaginationResponse<Task[]>> {
    const { skip, take } = calculatePagination(payload.pagination)

    const where = payload.searchParams
      ? transformSearchParams<Task, 'Task'>(payload.searchParams, 'Task')
      : {}

    const total = await prisma.task.count()

    const data = await prisma.task.findMany({
      where,
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        description: true,
        project: nameSelector,
        projectId: true,
        user: nickNameSelector,
        userId: true,
        dailyTasks: idSelector,
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
    return prisma.task.delete({
      where: { id },
    })
  }
}
