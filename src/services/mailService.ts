import nodemailer, { Transporter } from 'nodemailer'

export class MailService {
  private senderEmail: string
  private transporter: Transporter

  constructor(service: string, senderEmail: string, senderEmailPass: string) {
    this.senderEmail = senderEmail
    this.transporter = nodemailer.createTransport({
      service,
      auth: {
        user: senderEmail,
        pass: senderEmailPass,
      },
    })
  }

  public async sendMail(to: string, subject: string, text: string, html?: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.senderEmail,
        to,
        subject,
        text,
        html,
      })
    } catch (err) {
      console.error(err)
    }
  }
}

export const initMailService = () => {
  const mail_service = process.env.MAIL_SERVICE || 'gmail'
  const sender_email = process.env.SENDER_EMAIL || 'reportgenerator303@gmail.com'
  const sender_email_pass = process.env.SENDER_EMAIL_PASS || 'fxqd qjek liuy zsfl'

  return new MailService(mail_service, sender_email, sender_email_pass)
}
