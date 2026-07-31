import jwt from 'jsonwebtoken'
import { UserService } from './userService'
import { randomInt } from 'crypto'
import { MailService } from './mailService'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret-key-change-in-production'
const ACCESS_TOKEN_EXPIRY = '60m'
const REFRESH_TOKEN_EXPIRY = '7d'

export class AuthService {
  constructor(readonly userService: UserService, readonly mailService: MailService | null) {}

  public generateTokens(user: { id: number; email: string }) {
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

  private generateOTP() {
    return Array.from({ length: 4 }, () => randomInt(10)).join('')
  }

  public async sendOtp(email: string) {
    const user = await this.userService.getUserByEmail(email)


    if (!user) {
      throw new Error('User not found')
    }

    if (!this.mailService) {
      const response = await this.userService.update(user.id, { otp:process.env.TEST_OTP })

      return
    }

    const otp = this.generateOTP()

    await this.userService.update(user.id, { otp })
    await this.mailService.sendMail(email, 'OTP', `Your OTP is: ${otp}`)

    setTimeout(() => {
      this.userService.update(user.id, { otp: null })
    }, 180000)
  }
}
