import { NextFunction, Request, Response } from 'express'
import { UserService } from '../services/userService'
import jwt from 'jsonwebtoken'
import { userService } from '../services/servicesInit'
import { NotFoundError, RefreshTokenError } from '../errors/AppError'
import { AuthService } from '../services/authService'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret-key-change-in-production'
const ACCESS_TOKEN_EXPIRY = '60m'
const REFRESH_TOKEN_EXPIRY = '7d'

export class AuthController {
  constructor(readonly userService: UserService, readonly authService: AuthService) {}

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
      await this.authService.sendOtp(email)

      res.status(200).json(`OTP has been sended to ${email}`)
    } catch (err) {
      next(err)
    }
  }

  /**
   * @swagger
   * /auth/otp:
   *   post:
   *     summary: Authenticate user by OTP
   *     description: Verifies user's email and one-time password and returns user ID.
   *     tags:
   *       - Authentication
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - otp
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: User's email address
   *                 example: john.doe@example.com
   *               otp:
   *                 type: string
   *                 description: One time password
   *                 example: "5421"
   *     responses:
   *       200:
   *         description: Successfully authenticated - returns user ID
   *         content:
   *           application/json:
   *             schema:
   *               type: integer
   *             example: 123
   *       401:
   *         description: Invalid or expired OTP
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             examples:
   *               invalidOTP:
   *                 summary: Invalid OTP
   *                 value:
   *                   error: "Invalid OTP"
   *               expiredOTP:
   *                 summary: OTP expired
   *                 value:
   *                   error: "OTP expired"
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               error: "User not found"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               error: "Internal server error"
   */
  async OTPVerify(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body

      const user = await this.userService.getUserByEmail(email)

      if (!user) {
        return res.status(404).json({
          message: 'User not found',
        })
      }

      const dbOtp = await this.userService.getOtp(email)

      const isTestOtp = process.env.NODE_ENV !== 'production' && otp === process.env.TEST_OTP

      if (!dbOtp && !isTestOtp) {
        return res.status(401).json({
          message: 'OTP expired',
        })
      }

      if (otp !== dbOtp && !isTestOtp) {
        return res.status(401).json({
          message: 'Invalid OTP',
        })
      }

      await this.userService.update(user.id, {
        otp: null,
      })

      const { accessToken, refreshToken } = this.authService.generateTokens({
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
        path: '/auth/refresh',
      })

      return res.status(200).json(user.id)
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
        throw new RefreshTokenError('Refresh token not found')
      }

      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
        id: number
        email: string
        type: string
      }

      if (decoded.type !== 'refresh') {
        throw new RefreshTokenError('Invalid token type')
      }

      const user = await this.userService.getUserById(decoded.id)
      if (!user) {
        throw new NotFoundError('User not found')
      }

      const { accessToken, refreshToken: newRefreshToken } = this.authService.generateTokens({
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
        path: '/auth/refresh',
      })

      res.status(200).json({ message: 'Tokens refreshed successfully' })
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
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/auth/refresh',
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
        throw new Error('Not authenticated')
      }

      const response = jwt.verify(token, JWT_SECRET) as { id: number; email: string }

      const user = await userService.getUserById(response.id)

      res.status(200).json(user)
    } catch (err) {
      next(err)
    }
  }
}
