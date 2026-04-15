import { Project } from '@prisma/client'
import { prisma } from '../prisma'
import { TPaginationProps, TWithPaginationResponse } from '../types/common'
import { calculatePagination } from '../helpers/paginationCount'
import { transformSearchParams } from '../helpers/transformSearchParams'
import {
  baseProjectSelector,
  fullProjectSelector
} from '../helpers/prismaSelectors'
import { getSortParams } from '../helpers/getSortParams'
import { buildSearch } from '../helpers/buildSearch'
import { buildWhere } from '../helpers/buildWhere'

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
    searchParams?: Record<string, string | undefined>
    pagination?: TPaginationProps
  }): Promise<TWithPaginationResponse<Project[]>> {
    const { skip, take } = calculatePagination(payload.pagination)

    const filters = payload.searchParams
      ? transformSearchParams<Project, 'Project'>(payload.searchParams, 'Project')
      : {}
    const search = buildSearch<Project>(payload.searchParams, ['name'])
    const where = buildWhere<Project>(filters, search)

    const total = await prisma.project.count({ where })

    const orderBy = getSortParams(payload.searchParams)

    const data = await prisma.project.findMany({
      where,
      select: baseProjectSelector,
      skip,
      take,
      orderBy,
    })

    return {
      data,
      total,
    }
  }

  async getProjectById(id: number) {
    return prisma.project.findUnique({
      where: { id },
      select: fullProjectSelector,
    })
  }

  async delete(id: number) {
    return prisma.project.delete({
      where: { id },
    })
  }
}
