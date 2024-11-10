import path from "path";
import fs from "node:fs";
import { BLOG_RESULT } from "./globals.mjs";
import { srcDirName, nodeModulesDirName, buildDirName } from "./constants.mjs";
import { md } from "./init-md.mjs";

export function generateIndex() {
  console.info("generateIndex: start");

  copyStaticAssets();

  const tocHtml = generateTocHtml();

  let data = fs.readFileSync(
    path.join(srcDirName, "templates/index.html"),
    "utf8"
  );
  data = data.replaceAll("<!--@blogEngine:toc-->", tocHtml);
  data = data.replaceAll("<!--@blogEngine:title-->", BLOG_RESULT.meta.title);
  data = data.replaceAll(
    "<!--@blogEngine:description-->",
    BLOG_RESULT.meta.description
  );
  data = data.replaceAll(
    "<!--@blogEngine:ad_blockId-->",
    BLOG_RESULT.meta.yandexAd.blockId
  );
  data = data.replaceAll(
    "<!--@blogEngine:ad_renderTo-->",
    BLOG_RESULT.meta.yandexAd.renderTo
  );
  data = data.replaceAll(
    "<!--@blogEngine:ad_description-->",
    BLOG_RESULT.meta.yandexAd.description
  );
  fs.writeFileSync(path.join(buildDirName, "index.html"), data, "utf-8");

  console.info("generateIndex: finish");
}

function generateTocHtml() {
  //console.log("blogResultModel=", blogResultModel);
  let tocMd = "";
  for (const page of BLOG_RESULT.pages) {
    tocMd += `* [${page.title}](${page.link})` + "\n";
  }
  const tocHtml = md.render(tocMd);
  //console.log("tocHtml=", tocHtml);
  return tocHtml;
}

function copyStaticAssets() {
  fs.copyFileSync(
    path.join(nodeModulesDirName, "highlight.js/styles/default.min.css"),
    path.join(buildDirName, "highlight-default.min.css")
  );
  fs.copyFileSync(
    path.join(srcDirName, "templates/main.js"),
    path.join(buildDirName, "main.js")
  );
  fs.copyFileSync(
    path.join(srcDirName, "templates/style.css"),
    path.join(buildDirName, "style.css")
  );
}

export function getBlogMeta() {
  const meta = fs.readFileSync(
    path.join(srcDirName, "pages/blog-meta.json"),
    "utf8"
  );
  return JSON.parse(meta);
}
