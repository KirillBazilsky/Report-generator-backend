import { User } from '@prisma/client'
import { prisma } from '../prisma'
import { TPaginationProps, TWithPaginationResponse } from '../types/common'
import { calculatePagination } from '../helpers/paginationCount'
import { transformSearchParams } from '../helpers/transformSearchParams'
import { baseUserSelector, fullUserSelector, idSelector } from '../helpers/prismaSelectors'

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
    const where = payload.searchParams
      ? transformSearchParams<User, 'User'>(payload.searchParams, 'User')
      : {}

    const { skip, take } = calculatePagination(payload.pagination)

    const total = await prisma.user.count({ where })

    const data = await prisma.user.findMany({
      where,
      select: baseUserSelector,
      skip,
      take,
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
