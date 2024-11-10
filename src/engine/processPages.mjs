import fs from "node:fs";
import path from "path";
import { globSync } from "glob";
import { md } from "./init-md.mjs";
import { srcDirName, buildDirName } from "./constants.mjs";
import { BLOG_RESULT } from "./globals.mjs";

export function generatePages() {
  console.info("generatePages: start");

  const fileNames = globSync(srcDirName + "/pages/*/*/meta.json", {});
  console.log("fileNames:", fileNames);

  for (let fileName of fileNames) {
    fileName = fileName.substring(3); //cut 'src'
    fileName = path.join(srcDirName, fileName);
    pageGeneration(path.join(fileName, ".."));
  }

  console.info("generatePages: finish");
}

function pageGeneration(srcPageDirName) {
  console.info("generating " + srcPageDirName);

  const meta = getMeta(srcPageDirName);

  const buildPageDirName = srcPageDirName.replace(srcDirName, buildDirName);
  const buildPageFileName = path.join(
    buildPageDirName,
    meta.fileName.replace(".md", ".html")
  );

  meta.link = buildPageFileName
    .replaceAll(buildDirName, "")
    .substring(1)
    .replaceAll("\\", "/");
  console.log("link=" + meta.link);

  fs.mkdirSync(buildPageDirName, { recursive: true });

  copyStaticAssets(srcPageDirName, buildPageDirName);

  const pageHtml = generatePageHtml(path.join(srcPageDirName, meta.fileName));
  meta.html = pageHtml;
  meta.shortHtml = generatePageHtml(
    path.join(srcPageDirName, meta.fileName),
    true
  );

  let data = fs.readFileSync(
    path.join(srcDirName, "templates/page.html"),
    "utf8"
  );
  data = data.replaceAll("<!--@blogEngine:page_title-->", meta.title);
  data = data.replaceAll(
    "<!--@blogEngine:page_description-->",
    meta.description
  );
  data = data.replaceAll("<!--@blogEngine:page_html-->", pageHtml);
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
  fs.writeFileSync(buildPageFileName, data, "utf-8");

  BLOG_RESULT.pages.push(meta);
}

function generatePageHtml(srcPageFileName, short) {
  let pageData = fs.readFileSync(srcPageFileName, "utf8");
  let pageHtml;
  if (short) {
    //TODO:remove images and etc, use only paragraph
    pageData = pageData.substring(0, 100) + "...";
    pageHtml = md.render(pageData);
  } else {
    pageHtml = md.render(pageData);
  }
  // console.log("pageHtml:", pageHtml);
  return pageHtml;
}

function copyStaticAssets(pageDirName, buildPageDirName) {
  // fs.copyFileSync(sourcePageFolderName + "/*.*", resultFolderName);
  fs.cpSync(pageDirName, buildPageDirName, {
    recursive: true,
    filter: (src, dest) => {
      return !src.endsWith(".md") && !src.endsWith("meta.json");
    },
  });
}

function getMeta(pageDirName) {
  const meta = fs.readFileSync(path.join(pageDirName, "meta.json"), "utf8");
  return JSON.parse(meta);
}
