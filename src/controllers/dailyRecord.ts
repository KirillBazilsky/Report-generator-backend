import { NextFunction, Request, Response } from 'express'
import { DailyRecordService } from '../services/dailyRecordService'
import { getWithPagination } from '../helpers/getWithPagination'
import { DailyRecord } from '@prisma/client'

export class DailyRecordController {
  constructor(readonly dailyRecordService: DailyRecordService) {}

  /**
   * @swagger
   * /daily-records:
   *   post:
   *     summary: Create a new daily record entry
   *     description: |
   *       Returns new daily record
   *     tags: [Daily Records]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *             properties:
   *               userId:
   *                 type: integer
   *                 description: ID of the user
   *                 example: 10
   *               date:
   *                 type: string
   *                 description: ISO string of the record date
   *                 example: 2024-03-30
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DailyRecordFull'
   *       400:
   *         description: Invalid query parameters
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, date } = req.body
      const record = await this.dailyRecordService.create(userId, date)

      res.status(200).json(record)
    } catch (err) {
      next(err)
    }
  }

  /**
   * @swagger
   * /daily-records:
   *   get:
   *     summary: Get daily records with filtering or pagination
   *     description: |
   *       Returns users based on query parameters.
   *       - If `id` is provided, returns a single object.
   *       - Otherwise, returns a paginated list of daily records.
   *     tags: [Daily Records]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number
   *         example: 1
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Number of items per page
   *         example: 10
   *       - in: query
   *         name: id
   *         schema:
   *           type: integer
   *         description: Get daily record by exact ID (overrides pagination)
   *       - in: query
   *         name: userId
   *         schema:
   *           type: integer
   *         description: Filter by user ID
   *         example: 5
   *       - in: query
   *         name: date
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter by specific date
   *         example: "2024-03-30"
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [id, date, userId]
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *     responses:
   *       200:
   *         description: Paginated list of daily records
   *         content:
   *           application/json:
   *             schema:
   *               oneOf:
   *                  # Case 1: Single daily record (by id)
   *                  - type: object
   *                    properties:
   *                      data: 
   *                        $ref: '#/components/schemas/DailyRecordFull'
   *                  # Case 2: Paginated list
   *                  - type: object
   *                    properties:
   *                      data:
   *                      type: array
   *                      items:
   *                        $ref: '#/components/schemas/DailyRecordBase'
   *                      total:
   *                        type: integer
   *       400:
   *         description: Invalid query parameters
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.query

      if (id) {
        const dailyRecord = await this.dailyRecordService.getDailyRecordById(Number(id))

        return res.json({ data: dailyRecord })
      }

      return getWithPagination<DailyRecord>(req, res, this.dailyRecordService.get)
    } catch (err) {
      next(err)
    }
  }

  /**
   * @swagger
   * /daily-records:
   *   put:
   *     summary: Update a daily record
   *     description: Updates an existing daily record for a user
   *     tags: [Daily Records]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - id
   *               - data
   *             properties:
   *               id:
   *                 type: integer
   *                 description: ID of the daily record
   *                 example: 5
   *               payload:
   *                 type: object
   *                 description: Data to update
   *                 properties:
   *                   date:
   *                     type: string
   *                     format: date
   *                     example: "2024-03-30"
   *                   projectIds:
   *                     type: array
   *                     items:
   *                       type: integer
   *                     description: IDs of projects to associate
   *                     example: [1, 2, 3]
   *     responses:
   *       200:
   *         description: Daily record updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DailyRecordFull'
   *       400:
   *         description: Invalid input or record not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, payload } = req.body
      const record = await this.dailyRecordService.update(id, payload)

      res.status(200).json(record)
    } catch (err) {
      next(err)
    }
  }

  /**
   * @swagger
   * /daily-records:
   *   delete:
   *     summary: Delete a daily record
   *     description: Deletes a daily record by ID
   *     tags: [Daily Records]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - id
   *             properties:
   *               id:
   *                 type: integer
   *                 description: ID of the daily record to delete
   *                 example: 10
   *     responses:
   *       200:
   *         description: Daily record deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Daily record deleted successfully"
   *                 deletedRecord:
   *                   $ref: '#/components/schemas/DailyRecordBase'
   *       400:
   *         description: Invalid ID or record not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body
      const response = await this.dailyRecordService.delete(id)

      res.status(200).json(response)
    } catch (err) {
      next(err)
    }
  }
}
