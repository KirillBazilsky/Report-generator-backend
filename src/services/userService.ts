import { User } from '@prisma/client'
import { prisma } from '../prisma'
import { TPaginationProps, TWithPaginationResponse } from '../types/common'
import { calculatePagination } from '../helpers/paginationCount'
import { transformSearchParams } from '../helpers/transformSearchParams'

export class UserService {
  async create(email: string, nickname: string) {
    return prisma.user.create({
      data: { email, nickname },
    })
  }

  async getUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: { projects: true, tasks: true, dailyRecords: true },
    })
  }

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { projects: true, tasks: true, dailyRecords: true },
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

    const total = await prisma.user.count()

    const data = await prisma.user.findMany({
      where,
      include: {
        dailyRecords: true,
        projects: true,
        tasks: true,
      },
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
