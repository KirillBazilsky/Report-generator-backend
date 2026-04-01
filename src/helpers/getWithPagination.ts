import { Request, Response } from 'express'
import { TPaginationProps, TWithPaginationResponse } from '../types/common'

export const getWithPagination = async <T>(
  req: Request,
  res: Response,
  method: (payload: {
    searchParams?: Record<string, string | undefined>
    pagination?: TPaginationProps
  }) => Promise<TWithPaginationResponse<T[]>>
) => {
  try {
    const { page, pageSize, ...searchParams } = req.query

    const response = await method({
      searchParams: { ...(searchParams as Record<string, string | undefined>)},
      pagination: {
        page: Number(page ?? 1),
        pageSize: Number(pageSize ?? 10),
      },
    })

    res.status(200).json(response)
  } catch (err) {
    res.status(400).json({ error: err })
  }
}
