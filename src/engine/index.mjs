import markdownit from "markdown-it";
import fs from "node:fs";
import path from "path";
import { last } from "./utils.mjs";

console.info("init engine...");

const md = markdownit();
const basePath = path.join(import.meta.dirname, "../../src");
console.log("basePath=" + basePath);
const buildDirPath = path.join(basePath, "../build");
let blogResultModel = [];

console.info("finish init engine...");

export const engine = () => {
  console.info("run engine...");

  blogResultModel = [];

  let blogModel = fs.readFileSync(
    path.join(basePath, "/pages/blog-model.json"),
    "utf8"
  );
  console.log(blogModel);
  blogModel = JSON.parse(blogModel);

  if (fs.existsSync(buildDirPath)) {
    fs.rmSync(buildDirPath, { recursive: true, force: true });
  }
  fs.mkdirSync(buildDirPath);
  fs.mkdirSync(path.join(buildDirPath, "pages"));

  for (let pagePath of blogModel.pages) {
    pageGeneration(pagePath);
  }

  fs.copyFileSync(basePath + "/pages/main.js", buildDirPath + "/main.js");
  fs.copyFileSync(basePath + "/pages/style.css", buildDirPath + "/style.css");
  generateIndex();

  console.info("finish engine...");
};

function generateIndex() {
  console.info("generateIndex::start");

  let data = fs.readFileSync(basePath + "/pages/index-template.html", "utf8");

  //console.log("blogResultModel=", blogResultModel);
  let tocMd = "";
  for (const pageModel of blogResultModel) {
    tocMd += `* [${pageModel.name}](${pageModel.link})` + "\n";
  }
  const tocHtml = md.render(tocMd);
  console.log("tocHtml=", tocHtml);
  data = data.replaceAll("<!--@blogEngine:toc-->", tocHtml);

  fs.writeFileSync(buildDirPath + "/index.html", data, "utf-8");

  console.info("generateIndex::finish");
}

function pageGeneration(pagePath) {
  console.info("generating " + pagePath);

  const sourcePageName = path.join(basePath, "pages", pagePath);

  const pageData = fs.readFileSync(sourcePageName, "utf8");
  const result = md.render(pageData);
  // console.log(result);
  let resultFileName = pagePath.replaceAll("/", "_");
  resultFileName = resultFileName.substr(1, resultFileName.length - 4);
  console.log("resultFileName=", resultFileName);
  const resultFolderName = path.join(buildDirPath, "pages", resultFileName);
  fs.mkdirSync(resultFolderName);
  fs.writeFileSync(
    path.join(resultFolderName, resultFileName + ".html"),
    result,
    "utf-8"
  );

  // fs.copyFileSync(sourcePageFolderName + "/*.*", resultFolderName);
  const sourcePageFolderName = path.join(sourcePageName, "..");
  fs.cpSync(sourcePageFolderName, resultFolderName, {
    recursive: true,
    filter: (src, dest) => !src.endsWith(".md"),
  });

  const tmp = last(resultFileName.split("/"));
  blogResultModel.push({
    name: tmp,
    link: `pages/${tmp}/${tmp}.html`,
    html: result,
  });

  console.info("generating " + pagePath + " finished");
}
