import { EmailProvider } from "../email.interface";

export class SesEmailProvider implements EmailProvider {
  async sendEmail(): Promise<void> {
    throw new Error("SES provider not implemented yet.");
  }
}