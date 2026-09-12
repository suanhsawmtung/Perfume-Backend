import { createEmailProvider } from "./email.factory";

export class EmailService {
  private provider = createEmailProvider();

  async sendOtpEmail(to: string, otp: string) {
    await this.provider.sendEmail({
      to,
      subject: "Your verification code",
      html: `
<p>Your verification code is:</p>
<p style="font-size:24px;font-weight:700;letter-spacing:0.2em;margin:16px 0;">${otp}</p>
<p>This code expires in a few minutes. If you did not request it, you can ignore this email.</p>
`.trim(),
    });
  }
}
