import markdownit from "markdown-it";
import hljs from "highlight.js";
import fs from "node:fs";
import path from "path";
import { last } from "./utils.mjs";

console.info("init engine...");

const md = markdownit({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre><code class="hljs">' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          "</code></pre>"
        );
      } catch (__) {}
    }

    return (
      '<pre><code class="hljs">' + md.utils.escapeHtml(str) + "</code></pre>"
    );
  },
});

//https://publishing-project.rivendellweb.net/customizing-markdown-it/
md.renderer.rules.image = function (tokens, idx, options, env, slf) {
  //   const token = tokens[idx];
  //   token.attrSet("class", "blogImage");
  const original = slf.renderToken(tokens, idx, options);
  return `<div class="blogImage_container">${original}</div>`;
};

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

  fs.copyFileSync(
    path.join(basePath, "../node_modules/highlight.js/styles/default.min.css"),
    buildDirPath + "/highlight-default.min.css"
  );
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

  let htmlWrap = fs.readFileSync(
    basePath + "/pages/page-template.html",
    "utf8"
  );
  htmlWrap = htmlWrap.replace("<!--@blogEngine:paper_id-->", result);

  fs.writeFileSync(
    path.join(resultFolderName, resultFileName + ".html"),
    htmlWrap,
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
