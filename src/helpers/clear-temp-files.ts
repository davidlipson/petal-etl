import { tempDataPath } from "../pipelines/pipeline";
import fs from "fs";

export const clearTempFiles = () => {
  try {
    fs.readdirSync(tempDataPath).forEach((file) => {
      fs.rmSync(`${tempDataPath}/${file}`, { recursive: true });
    });
  } catch (err) {
    console.log(err);
  }
};
