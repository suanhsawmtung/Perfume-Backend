import { env } from "../../config/env";
import { EmailProvider } from "./email.interface";
import { LogEmailProvider } from "./providers/log.provider";
import { SendGridEmailProvider } from "./providers/sendgrid.provider";
import { SesEmailProvider } from "./providers/ses.provider";
import { SmtpEmailProvider } from "./providers/smtp.provider";

export const createEmailProvider = (): EmailProvider => {
  switch (env.emailProvider) {
    case "smtp":
      return new SmtpEmailProvider();

    case "ses":
      return new SesEmailProvider();

    case "sendgrid":
      return new SendGridEmailProvider();

    case "log":
    default:
      return new LogEmailProvider();
  }
};