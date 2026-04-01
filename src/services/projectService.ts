import { Project } from '@prisma/client'
import { prisma } from '../prisma'
import { TPaginationProps, TWithPaginationResponse } from '../types/common'
import { calculatePagination } from '../helpers/paginationCount'
import { transformSearchParams } from '../helpers/transformSearchParams'

export class ProjectService {
  async create(name: string, userId: number) {
    return prisma.project.create({
      data: {
        name: name,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    })
  }

  async get(payload: {
    searchParams?: Record<string, string>
    pagination?: TPaginationProps
  }): Promise<TWithPaginationResponse<Project[]>> {
    const { skip, take } = calculatePagination(payload.pagination)

    const where = payload.searchParams
      ? transformSearchParams<Project, 'Project'>(payload.searchParams, 'Project')
      : {}

    const total = await prisma.project.count()

    const data = await prisma.project.findMany({
      where,
      include: {
        dailyRecords: true,
        tasks: true,
        user: true,
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
    return prisma.project.delete({
      where: { id },
    })
  }
}
