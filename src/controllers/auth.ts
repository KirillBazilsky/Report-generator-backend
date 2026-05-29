import { NextFunction, Request, Response } from 'express'
import { UserService } from '../services/userService'
import jwt from 'jsonwebtoken'
import { userService } from '../services/servicesInit'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'

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
  async auth(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.params
      const user = await this.userService.getUserByEmail(email)

      if (!user) {
        throw new Error('User not found')
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      )

      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
      })

      res.status(200).json(user.id)
    } catch (err) {
      next(err)
    }
  }

  /**
   * @swagger
   * /auth/logout:
   *   get:
   *     summary: logout user
   *     description: Returns message `Logged out successfully`
   *     tags: [Authentication]
   *     responses:
   *       200:
   *         description: Successfully logged out
   *         content:
   *           application/json:
   *             schema:
   *               type: string
   *               description: message
   *             example: Logged out successfully
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               error: "Internal server error"
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
      res.status(200).json({ message: 'Logged out successfully' })
    } catch (err) {
      next(err)
    }
  }

  /**
   * @swagger
   * /auth/logged:
   *   get:
   *     summary: get logged user by cookies
   *     description: Returns user if user exists
   *     tags: [Authentication]
   *     responses:
   *       200:
   *         description: Successfully authenticated - returns user ID
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Bad request - user not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             examples:
   *               userNotFound:
   *                 summary: User not found
   *                 value:
   *                   error: "User not found"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               error: "Internal server error"
   */

  async getLoggedUser(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.authToken

      if (!token) {
        return res.status(401).json({ message: 'Not authenticated' })
      }

      const response = jwt.verify(token, JWT_SECRET) as { id: number; email: string }

      const user = await userService.getUserById(response.id)

      res.status(200).json(user)
    } catch (err) {
      next(err)
    }
  }
}
