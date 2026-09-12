import { Resend } from "resend";
import { env } from "../../../config/env";
import { EmailProvider } from "../email.interface";

export class SmtpEmailProvider implements EmailProvider {
  private readonly resend = new Resend(env.resendApiKey);

  async sendEmail({
    to,
    subject = "Your verification code",
    html,
    text,
  }: any): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: env.resendFromEmail,
      to,
      subject,
      html,
    });

    if (error) {
      throw new Error(
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "Failed to send email",
      );
    }
  }
}
