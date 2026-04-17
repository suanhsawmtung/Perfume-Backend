import { EmailProvider } from "../email.interface";

export class SmtpEmailProvider implements EmailProvider {
  async sendEmail(): Promise<void> {
    throw new Error("SMTP provider not implemented yet.");
  }
}