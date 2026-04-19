import fs from "fs/promises";
import path from "path";

export const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

export const getFilePath = (...paths: string[]) => {
  return path.join(process.cwd(), ...paths);
};

export const removeFile = async (filePath: string) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.warn(error);
  }
};

export const removeFolder = async (folderPath: string) => {
  try {
    await fs.rm(folderPath, { recursive: true });
  } catch (error) {
    console.warn(error);
  }
};