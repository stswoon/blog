import fs from "node:fs";
import path from "path";
import { clearBlogResult } from "./globals.mjs";
import { buildDirName } from "./constants.mjs";
import { generatePages } from "./processPages.mjs";
import { generateIndex, getBlogMeta } from "./processIndex.mjs";
import { BLOG_RESULT } from "./globals.mjs";

export const runBlogEngine = () => {
  console.info("runBlogEngine:start");

  clearBlogResult();
  clearAndCreateBuildDir();

  const meta = getBlogMeta();
  BLOG_RESULT.meta = meta;

  generatePages();
  generateIndex();

  console.info("runBlogEngine: finish");
  console.info("runBlogEngine: SUCCESS");
};

function clearAndCreateBuildDir() {
  if (fs.existsSync(buildDirName)) {
    fs.rmSync(buildDirName, { recursive: true, force: true });
  }
  fs.mkdirSync(buildDirName);
  fs.mkdirSync(path.join(buildDirName, "assets"));
}
