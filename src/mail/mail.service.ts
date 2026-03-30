import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendAgentInvite(email: string, name: string, password: string) {
    try {
      const response = await this.resend.emails.send({
        from: 'onboarding@resend.dev', 
        to: email,
        subject: 'You are invited to SalesTrack Academy',
        html: `
          <h2>Hello ${name},</h2>
          <p>You have been added as a Sales Agent.</p>

          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/login">
              Login here
            </a>
          </p>
        `,
      });

      console.log('Email sent:', response);
    } catch (error) {
      console.error('Email failed:', error);
    }
  }
}