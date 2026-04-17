import fs from "fs/promises";
import { ensureDir, getFilePath } from "../../../utils/file";
import { EmailProvider } from "../email.interface";

export class LogEmailProvider implements EmailProvider {
  async sendEmail({ to, subject, html, text }: any): Promise<void> {
    const logsDir = getFilePath("logs");
    const logPath = getFilePath("logs", "otp.log");

    await ensureDir(logsDir);

    const message = `
[${new Date().toISOString()}]
TO: ${to}
SUBJECT: ${subject}
CONTENT: ${html || text}
-------------------------------------
`;

    await fs.appendFile(logPath, message);
  }
}