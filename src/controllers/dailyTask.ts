import { Request, Response } from 'express'
import { DailyTaskService } from '../services/dailyTaskService'
import { getWithPagination } from '../helpers/getWithPagination'
import { DailyTask } from '@prisma/client'

export class DailyTasksController {
  constructor(readonly dailyTaskService: DailyTaskService) {}

  /**
   * @swagger
   * /daily-tasks:
   *   post:
   *     summary: Create a new daily task entry
   *     description: Creates a daily task entry linking a task to a daily record
   *     tags: [Daily Tasks]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - recordId
   *               - taskId
   *             properties:
   *               recordId:
   *                 type: integer
   *                 description: ID of the daily record
   *                 example: 10
   *               taskId:
   *                 type: integer
   *                 description: ID of the task
   *                 example: 42
   *               taskData:
   *                 type: object
   *                 description: Additional task data (optional)
   *                 properties:
   *                   status:
   *                     $ref: '#/components/schemas/TaskStatus'
   *                   comment:
   *                     type: string
   *                     description: Progress comment
   *                     example: "Completed authentication module"
   *     responses:
   *       200:
   *         description: Daily task created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DailyTaskFull'
   *       400:
   *         description: Invalid input or record/task not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async create(req: Request, res: Response) {
    try {
      const { recordId, taskId, taskData } = req.body
      const response = await this.dailyTaskService.create(recordId, taskId, taskData)

      res.status(200).json(response)
    } catch (err) {
      res.status(400).json({ error: err })
    }
  }

  /**
   * @swagger
   * /daily-tasks:
   *   get:
   *     summary: Get daily tasks with filtering or pagination
   *     description: |
   *       Returns daily tasks based on query parameters.
   *       - If `id` is provided, returns a single daily task object.
   *       - Otherwise, returns a paginated list of daily tasks.
   *     tags: [Daily Tasks]
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
   *         description: Get daily task by exact ID (overrides pagination)
   *         example: 1
   *       - in: query
   *         name: dailyRecordId
   *         schema:
   *           type: integer
   *         description: Filter by daily record ID
   *         example: 10
   *       - in: query
   *         name: taskId
   *         schema:
   *           type: integer
   *         description: Filter by task ID
   *         example: 42
   *       - in: query
   *         name: status
   *         schema:
   *           $ref: '#/components/schemas/TaskStatus'
   *         description: Filter by task status
   *         example: "IN_PROGRESS"
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               oneOf:
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/DailyTaskBase'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/DailyTaskBase'
   *                     total:
   *                       type: integer
   *                       example: 42
   *       400:
   *         description: Invalid query parameters
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async get(req: Request, res: Response) {
    const { id } = req.query

    if (id) {
      const dailyTask = await this.dailyTaskService.getDailyTaskById(Number(id))

      return res.json({ data: dailyTask })
    }

    return getWithPagination<DailyTask>(req, res, this.dailyTaskService.get)
  }

  /**
   * @swagger
   * /daily-tasks:
   *   put:
   *     summary: Update a daily task entry
   *     description: Updates an existing daily task entry by ID
   *     tags: [Daily Tasks]
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
   *                 description: ID of the daily task to update
   *                 example: 100
   *               payload:
   *                 type: object
   *                 description: Data to update
   *                 properties:
   *                   status:
   *                     $ref: '#/components/schemas/TaskStatus'
   *                     description: New task status
   *                     example: DONE
   *                   comment:
   *                     type: string
   *                     description: Updated comment
   *                     example: "Finished all tests, ready for review"
   *     responses:
   *       200:
   *         description: Daily task updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DailyTaskFull'
   *       400:
   *         description: Invalid input or daily task not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async update(req: Request, res: Response) {
    try {
      const { id, payload } = req.body
      const response = await this.dailyTaskService.update(id, payload)

      res.status(200).json(response)
    } catch (err) {
      res.status(400).json({ error: err })
    }
  }

  /**
   * @swagger
   * /daily-tasks:
   *   delete:
   *     summary: Delete a daily task entry
   *     description: Deletes a daily task entry by ID
   *     tags: [Daily Tasks]
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
   *                 description: ID of the daily task to delete
   *                 example: 100
   *     responses:
   *       200:
   *         description: Daily task deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Daily task deleted successfully"
   *                 deletedTask:
   *                   $ref: '#/components/schemas/DailyTaskBase'
   *       400:
   *         description: Invalid ID or daily task not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.body
      const response = await this.dailyTaskService.delete(id)

      res.status(200).json(response)
    } catch (err) {
      res.status(400).json({ error: err })
    }
  }
}
