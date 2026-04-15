import { User } from '@prisma/client'
import { prisma } from '../prisma'
import { TPaginationProps, TWithPaginationResponse } from '../types/common'
import { calculatePagination } from '../helpers/paginationCount'
import { transformSearchParams } from '../helpers/transformSearchParams'
import { baseUserSelector, fullUserSelector } from '../helpers/prismaSelectors'
import { getSortParams } from '../helpers/getSortParams'
import { buildSearch } from '../helpers/buildSearch'
import { buildWhere } from '../helpers/buildWhere'

export class UserService {
  async create(email: string, nickname: string) {
    return prisma.user.create({
      data: { email, nickname },
    })
  }

  async getUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: fullUserSelector,
    })
  }

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: fullUserSelector,
    })
  }

  async get(payload: {
    searchParams?: Record<string, string | undefined>
    pagination?: TPaginationProps
  }): Promise<TWithPaginationResponse<User[]>> {
    const filters = payload.searchParams
      ? transformSearchParams<User, 'User'>(payload.searchParams, 'User')
      : {}
    const search = buildSearch<User>(payload.searchParams, ['nickname'])
    const where = buildWhere<User>(filters, search)

    const { skip, take } = calculatePagination(payload.pagination)

    const total = await prisma.user.count({ where })
    
    const orderBy = getSortParams(payload.searchParams)

    const data = await prisma.user.findMany({
      where,
      select: baseUserSelector,
      skip,
      take,
      orderBy,
    })

    return {
      data,
      total,
    }
  }

  async update(id: number, payload: Partial<User>) {
    return prisma.user.update({
      where: { id },
      data: payload,
    })
  }

  async delete(id: number) {
    return prisma.user.delete({
      where: {
        id,
      },
    })
  }
}
