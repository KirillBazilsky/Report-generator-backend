import { NextFunction, Request, Response } from 'express'
import { UserService } from '../services/userService'
import jwt from 'jsonwebtoken'
import { userService } from '../services/servicesInit'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret-key-change-in-production'
const ACCESS_TOKEN_EXPIRY = '60m' 
const REFRESH_TOKEN_EXPIRY = '7d'

export class AuthController {
  constructor(readonly userService: UserService) {}

  private generateTokens(user: { id: number; email: string }) {
    const accessToken = jwt.sign({ id: user.id, email: user.email, type: 'access' }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    })

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, type: 'refresh' },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    )

    return { accessToken, refreshToken }
  }

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
        res.status(404).json({ message: 'User not found' })
        throw new Error('User not found')
      }

      const { accessToken, refreshToken } = this.generateTokens({
        id: user.id,
        email: user.email,
      })

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000,
        path: '/',
      })

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth/refresh',
      })

      res.status(200).json(user.id)
    } catch (err) {
      next(err)
    }
  }

  /**
   * @swagger
   * /auth/refresh:
   *   post:
   *     summary: Refresh auth token
   *     tags: [Authentication]
   *     
   *     responses:
   *       200:
   *         description: Successfully authenticated 
   *       400:
   *         description: Bad request - user not found or invalid refresh token
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
  async refreshTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken

      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not found' })
      }

      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
        id: number
        email: string
        type: string
      }

      if (decoded.type !== 'refresh') {
        return res.status(401).json({ message: 'Invalid token type' })
      }

      const user = await this.userService.getUserById(decoded.id)
      if (!user) {
        return res.status(401).json({ message: 'User not found' })
      }

      const { accessToken, refreshToken: newRefreshToken } = this.generateTokens({
        id: user.id,
        email: user.email,
      })

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000,
        path: '/',
      })

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth/refresh',
      })

      res.status(200).json({ message: 'Tokens refreshed successfully' })
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        res.clearCookie('refreshToken')
        return res.status(401).json({ message: 'Refresh token expired, please login again' })
      }
      if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Invalid refresh token' })
      }
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
      const token = req.cookies?.accessToken

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
