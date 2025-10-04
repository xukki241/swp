import path from "path";
import fs from "fs";

const packageJsonPath = path.resolve(process.cwd(), "package.json");

if (!fs.existsSync(packageJsonPath)) {
  throw new Error("package.json not found");
}

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

export default pkg;
