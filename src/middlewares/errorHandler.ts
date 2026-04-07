import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { AppError } from '../errors/AppError'

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Duplicate entry',
          details: err.meta?.target,
        })
      case 'P2003':
        return res.status(400).json({
          error: 'Foreign key constraint failed',
          details: err.meta?.field_name,
        })
      case 'P2025':
        return res.status(404).json({
          error: 'Record not found',
        })
      default:
        console.error('Prisma error:', err)
        return res.status(500).json({ error: 'Database error' })
    }
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    })
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.message,
    })
  }

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON payload',
    })
  }

  console.error('Unhandled error:', err)

  const isProduction = process.env.NODE_ENV === 'production'
  res.status(500).json({
    error: 'Internal server error',
    ...(isProduction ? {} : { stack: err.stack, message: err.message }),
  })
}
