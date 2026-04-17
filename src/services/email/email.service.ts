import { createEmailProvider } from "./email.factory";

export class EmailService {
  private provider = createEmailProvider();

  async sendOtpEmail(to: string, otp: string) {
    await this.provider.sendEmail({
      to,
      subject: "Your OTP Code",
      html: `<h1>Your OTP is: ${otp}</h1>`,
    });
  }
}