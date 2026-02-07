import { Resend } from 'resend'

export class EmailService {
    private client: Resend | null = null
    private fromEmail: string

    constructor() {
        const apiKey = process.env.RESEND_API_KEY
        if (apiKey) {
            this.client = new Resend(apiKey)
        }
        this.fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev'
    }

    async sendWelcomeEmail(to: string, tenantName: string) {
        if (!this.client) {
            console.log(`[Email] (Simulated) Sending Welcome Email to ${to}`)
            return
        }

        try {
            await this.client.emails.send({
                from: this.fromEmail,
                to,
                subject: '歡迎加入 OMO Select',
                html: `<p>Hi ${tenantName},</p><p>歡迎使用 OMO Select 開店平台！</p>`
            })
        } catch (e) {
            console.error('[Email] Failed to send email:', e)
        }
    }

    async sendInvoice(to: string, amount: number, details: string) {
        if (!this.client) {
            console.log(`[Email] (Simulated) Sending Invoice to ${to}: $${amount}`)
            return
        }

        try {
            await this.client.emails.send({
                from: this.fromEmail,
                to,
                subject: `訂閱扣款通知: $${amount}`,
                html: `<p>本月帳單已扣款成功。</p><p>金額: $${amount}</p><p>明細: ${details}</p>`
            })
        } catch (e) {
            console.error('[Email] Failed to send email:', e)
        }
    }
}

export const emailService = new EmailService()
