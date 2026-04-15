import { NextFunction, Request, Response } from 'express'
import { UserService } from '../services/userService'
import { getWithPagination } from '../helpers/getWithPagination'
import { User } from '@prisma/client'

export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * @swagger
   * /users:
   *   post:
   *     summary: Create a new user
   *     description: Creates a new user with email and nickname
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateUserRequest'
   *     responses:
   *       200:
   *         description: User created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Invalid input or email already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, nickname } = req.body
      const response = await this.userService.create(email, nickname)

      res.status(200).json(response)
    } catch (err) {
      next(err)
    }
  }

  /**
   * @swagger
   * /users:
   *   get:
   *     summary: Get users with filtering or pagination
   *     description: |
   *       Returns users based on query parameters.
   *       - If `id` is provided, returns a single user object.
   *       - If `email` is provided, returns a single user object.
   *       - Otherwise, returns a paginated list of users.
   *     tags: [Users]
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
   *         description: Get user by exact ID (overrides pagination)
   *         example: 1
   *       - in: query
   *         name: email
   *         schema:
   *           type: string
   *           format: email
   *         description: Get user by exact email (overrides pagination)
   *         example: "john@example.com"
   *       - in: query
   *         name: nickname
   *         schema:
   *           type: string
   *         description: Filter by nickname (partial match)
   *         example: "john"
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [id, email, nickname]
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *       - in: query
   *         name: search
   *         description: global search by nickname
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Paginated list of users
   *         content:
   *           application/json:
   *             schema:
   *              oneOf:
   *                 # Case 1: Single user (by id or email)
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/UserFull'
   *                 # Case 2: Paginated list
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/UserBase'
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
      const { page, pageSize, ...searchParams } = req.query

      if (searchParams.email) {
        const user = await this.userService.getUserByEmail(searchParams.email as string)

        return res.json({ data: user })
      }

      if (searchParams.id) {
        const user = await this.userService.getUserById(Number(searchParams.id))

        return res.json({ data: user })
      }

      return getWithPagination<User>(req, res, this.userService.get)
    } catch (err) {
      next(err)
    }
  }

  /**
   * @swagger
   * /users:
   *   put:
   *     summary: Update a user
   *     description: Updates an existing user by ID
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - id
   *               - payload
   *             properties:
   *               id:
   *                 type: integer
   *                 description: ID of the user to update
   *                 example: 5
   *               payload:
   *                 type: object
   *                 description: User data to update
   *                 properties:
   *                   email:
   *                     type: string
   *                     format: email
   *                     description: Updated email address
   *                     example: "updated@example.com"
   *                   nickname:
   *                     type: string
   *                     description: Updated nickname
   *                     example: "updatednickname"
   *     responses:
   *       200:
   *         description: User updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Invalid input, user not found, or email already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, payload } = req.body
      const response = await this.userService.update(id, payload)

      res.status(200).json(response)
    } catch (err) {
      next(err)
    }
  }

  /**
   * @swagger
   * /users:
   *   delete:
   *     summary: Delete a user
   *     description: Deletes a user by ID (cascades to projects, tasks, and daily records)
   *     tags: [Users]
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
   *                 description: ID of the user to delete
   *                 example: 5
   *     responses:
   *       200:
   *         description: User deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "User deleted successfully"
   *                 deletedUser:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Invalid ID or user not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body
      const response = await this.userService.delete(id)

      res.status(200).json(response)
    } catch (err) {
      next(err)
    }
  }
}
