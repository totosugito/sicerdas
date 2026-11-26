import fs from "fs";
import path from "path";
import { SicerdasTui } from "./tui";

const arg = process.argv[2];
const target = arg ? path.resolve(arg) : process.cwd();

if (!fs.existsSync(target)) {
  console.error(`Path not found: ${target}`);
  process.exit(1);
}

const stat = fs.statSync(target);
const startDir = stat.isDirectory() ? target : path.dirname(target);

const tui = new SicerdasTui(startDir);
tui.start();
