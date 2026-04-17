import { EmailProvider } from "../email.interface";

export class SendGridEmailProvider implements EmailProvider {
  async sendEmail(): Promise<void> {
    throw new Error("SendGrid provider not implemented yet.");
  }
}