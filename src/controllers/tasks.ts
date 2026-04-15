import { NextFunction, Request, Response } from 'express'
import { TaskService } from '../services/taskService'
import { getWithPagination } from '../helpers/getWithPagination'
import { Task } from '@prisma/client'

export class TaskController {
  constructor(readonly taskService: TaskService) {}

  /**
   * @swagger
   * /tasks:
   *   post:
   *     summary: Create a new task
   *     description: Creates a new task for a user within a project
   *     tags: [Tasks]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - name
   *               - projectId
   *             properties:
   *               userId:
   *                 type: integer
   *                 description: ID of the user assigned to the task
   *                 example: 5
   *               name:
   *                 type: string
   *                 description: Task name/title
   *                 example: "Implement authentication middleware"
   *               projectId:
   *                 type: integer
   *                 description: ID of the project this task belongs to
   *                 example: 1
   *               description:
   *                 type: string
   *                 description: Detailed task description
   *                 example: "Add JWT validation middleware to protect routes"
   *               startDate:
   *                 type: string
   *                 description: start date ISO string
   *                 example: "2026-04-01T12:01:07.000Z"
   *     responses:
   *       200:
   *         description: Task created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       400:
   *         description: Invalid input, user not found, or project not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, name, projectId, description, startDate } = req.body
      const response = await this.taskService.create(
        userId,
        name,
        projectId,
        description,
        startDate
      )

      res.status(200).json(response)
    } catch (err) {
      next(err)
    }
  }

  /**
   * @swagger
   * /tasks:
   *   get:
   *     summary: Get tasks with filtering or pagination
   *     description: |
   *       Returns tasks based on query parameters.
   *       - If `id` is provided, returns a single task object.
   *       - Otherwise, returns a paginated list of tasks.
   *     tags: [Tasks]
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
   *         description: Get task by exact ID (overrides pagination)
   *         example: 1
   *       - in: query
   *         name: userId
   *         schema:
   *           type: integer
   *         description: Filter by user ID
   *         example: 5
   *       - in: query
   *         name: projectId
   *         schema:
   *           type: integer
   *         description: Filter by project ID
   *         example: 1
   *       - in: query
   *         name: status
   *         schema:
   *           $ref: '#/components/schemas/TaskStatus'
   *         description: Filter by task status
   *         example: "IN_PROGRESS"
   *       - in: query
   *         name: name
   *         schema:
   *           type: string
   *         description: Filter by task name (partial match)
   *         example: "authentication"
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [id, name, description, status, startDate, endDate, projectId, userId]
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *       - in: query
   *         name: search
   *         description: global search by name and description
   *         schema:
   *           type: string
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
   *                       $ref: '#/components/schemas/TaskFull'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/TaskBase'
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
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.query

      if (id) {
        const task = await this.taskService.getTaskById(Number(id))

        return res.json({ data: task })
      }

      return getWithPagination<Task>(req, res, this.taskService.get)
    } catch (err) {
      next(err)
    }
  }

  /**
   * @swagger
   * /tasks:
   *   put:
   *     summary: Update a task
   *     description: Updates an existing task. Provide userId and any fields to update
   *     tags: [Tasks]
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
   *                 description: ID of the task to update
   *                 example: 42
   *               payload:
   *                 type: object
   *                 properties:
   *                   name:
   *                     type: string
   *                     description: Updated task name
   *                     example: "Implement authentication with refresh tokens"
   *                   description:
   *                     type: string
   *                     description: Updated description
   *                     example: "Add JWT refresh token rotation mechanism"
   *                   status:
   *                     $ref: '#/components/schemas/TaskStatus'
   *                     description: Updated task status
   *                     example: IN_REVIEW
   *                   startDate:
   *                     type: string
   *                     format: date-time
   *                     description: Updated start date
   *                     example: "2024-03-25T10:00:00Z"
   *                   endDate:
   *                     type: string
   *                     format: date-time
   *                     description: Updated end date
   *                     example: "2024-03-30T18:00:00Z"
   *                   projectId:
   *                     type: integer
   *                     description: Updated project ID
   *                     example: 2
   *     responses:
   *       200:
   *         description: Task updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TaskFull'
   *       400:
   *         description: Invalid input, task not found, or project not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, payload } = req.body
      const response = await this.taskService.update(id, payload)

      res.status(200).json(response)
    } catch (err) {
      next(err)
    }
  }

  /**
   * @swagger
   * /tasks:
   *   delete:
   *     summary: Delete a task
   *     description: Deletes a task by ID
   *     tags: [Tasks]
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
   *                 description: ID of the task to delete
   *                 example: 42
   *     responses:
   *       200:
   *         description: Task deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Task deleted successfully"
   *                 deletedTask:
   *                   $ref: '#/components/schemas/TaskBase'
   *       400:
   *         description: Invalid ID or task not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body
      const response = await this.taskService.delete(id)

      res.status(200).json(response)
    } catch (err) {
      res.status(400).json({ error: err })
    }
  }
}
