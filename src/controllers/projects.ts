import { Request, Response } from 'express'
import { ProjectService } from '../services/projectService'
import { getWithPagination } from '../helpers/getWithPagination'
import { Project } from '@prisma/client'

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * @swagger
   * /projects:
   *   post:
   *     summary: Create a new project
   *     description: Creates a new project for a user
   *     tags: [Projects]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - name
   *             properties:
   *               userId:
   *                 type: integer
   *                 description: ID of the user who owns the project
   *                 example: 5
   *               name:
   *                 type: string
   *                 description: Name of the project
   *                 example: "E-commerce Platform"
   *     responses:
   *       200:
   *         description: Project created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ProjectFull'
   *       400:
   *         description: Invalid input or user not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async create(req: Request, res: Response) {
    try {
      const { userId, name } = req.body
      const user = await this.projectService.create(name, userId)

      res.status(200).json(user)
    } catch (err) {
      res.status(400).json({ error: err })
    }
  }

  /**
   * @swagger
   * /projects:
   *   get:
   *     summary: Get projects with filtering or pagination
   *     description: |
   *       Returns projects based on query parameters.
   *       - If `id` is provided, returns a single project object.
   *       - Otherwise, returns a paginated list of projects.
   *     tags: [Projects]
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
   *         description: Get project by exact ID (overrides pagination)
   *         example: 1
   *       - in: query
   *         name: userId
   *         schema:
   *           type: integer
   *         description: Filter by user ID
   *         example: 5
   *       - in: query
   *         name: name
   *         schema:
   *           type: string
   *         description: Filter by project name (partial match)
   *         example: "E-commerce"
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
   *                       $ref: '#/components/schemas/ProjectFull'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/ProjectBase'
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
      const project = await this.projectService.getProjectById(Number(id))

      return res.json({ data: project })
    }

    return getWithPagination<Project>(req, res, this.projectService.get)
  }

  /**
   * @swagger
   * /projects:
   *   delete:
   *     summary: Delete a project
   *     description: Deletes a project by ID (cascades to tasks)
   *     tags: [Projects]
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
   *                 description: ID of the project to delete
   *                 example: 1
   *     responses:
   *       200:
   *         description: Project deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Project deleted successfully"
   *                 deletedProject:
   *                   $ref: '#/components/schemas/ProjectBase'
   *       400:
   *         description: Invalid ID or project not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.body
      const response = await this.projectService.delete(id)

      res.status(200).json(response)
    } catch (err) {
      res.status(400).json({ error: err })
    }
  }
}
