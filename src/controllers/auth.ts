import { Request, Response } from 'express'
import { UserService } from '../services/userService'

export class AuthController {
  constructor(readonly userService: UserService) {}

  /**
   * @swagger
   * /auth/{email}:
   *   get:
   *     summary: Authenticate user by email
   *     description: Returns user ID if user exists with the provided email address
   *     tags: [Authentication]
   *     parameters:
   *       - in: path
   *         name: email
   *         required: true
   *         schema:
   *           type: string
   *           format: email
   *         description: User's email address
   *         example: john.doe@example.com
   *     responses:
   *       200:
   *         description: Successfully authenticated - returns user ID
   *         content:
   *           application/json:
   *             schema:
   *               type: integer
   *               description: User ID
   *             example: 123
   *       400:
   *         description: Bad request - user not found or invalid email
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             examples:
   *               userNotFound:
   *                 summary: User not found
   *                 value:
   *                   error: "User not found"
   *               invalidEmail:
   *                 summary: Invalid email format
   *                 value:
   *                   error: "Invalid email format"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               error: "Internal server error"
   */
  async auth(req: Request, res: Response) {
    try {
      const { email } = req.params
      const user = await this.userService.getUserByEmail(email)

      if (!user) {
        throw new Error('User not found')
      }

      res.status(200).json(user.id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Internal server error'
      const statusCode = errorMessage === 'User not found' ? 400 : 500
      res.status(statusCode).json({ error: errorMessage })
    }
  }
}
