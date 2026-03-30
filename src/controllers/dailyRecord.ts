import { Request, Response } from 'express'
import { DailyRecordService } from '../services/dailyRecordService'
import { getWithPagination } from '../helpers/getWithPagination'
import { DailyRecord } from '@prisma/client'

export class DailyRecordController {
  constructor(readonly dailyRecordService: DailyRecordService) {}

  /**
   * @swagger
   * /daily-records:
   *   post:
   *     summary: Create a new daily record
   *     description: Creates a daily record for a user for the current date
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
   *                 example: 5
   *               date:
   *                 type: string
   *                 format: date
   *                 description: Date for the record (optional, defaults to current date)
   *                 example: "2024-03-30"
   *     responses:
   *       200:
   *         description: Daily record created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DailyRecord'
   *       400:
   *         description: Invalid input or user not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async create(req: Request, res: Response) {
    try {
      const { userId, date } = req.body
      const record = await this.dailyRecordService.create(userId)

      res.status(200).json(record)
    } catch (err) {
      res.status(400).json({ error: err })
    }
  }

  /**
   * @swagger
   * /daily-records:
   *   get:
   *     summary: Get all daily records with pagination
   *     description: Returns a paginated list of daily records
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
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Number of items per page
   *         example: 10
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
   *     responses:
   *       200:
   *         description: Paginated list of daily records
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/DailyRecord'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     total:
   *                       type: integer
   *                     pages:
   *                       type: integer
   *       400:
   *         description: Invalid query parameters
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async get(req: Request, res: Response) {
    return getWithPagination<DailyRecord>(req, res, this.dailyRecordService.get)
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
   *               - userId
   *               - data
   *             properties:
   *               userId:
   *                 type: integer
   *                 description: ID of the user
   *                 example: 5
   *               data:
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
   *               $ref: '#/components/schemas/DailyRecord'
   *       400:
   *         description: Invalid input or record not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async update(req: Request, res: Response) {
    try {
      const { userId, data } = req.body
      const record = await this.dailyRecordService.update(userId, data)

      res.status(200).json(record)
    } catch (err) {
      res.status(400).json({ error: err })
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
   *                   $ref: '#/components/schemas/DailyRecord'
   *       400:
   *         description: Invalid ID or record not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.body
      const response = await this.dailyRecordService.delete(id)

      res.status(200).json(response)
    } catch (err) {
      res.status(400).json({ error: err })
    }
  }
}
