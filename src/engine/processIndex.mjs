import path from "path";
import fs from "node:fs";
import {BLOG} from "./globals.mjs";
import {srcDirName, nodeModulesDirName, buildDirName} from "./constants.mjs";
import {parseRussianDate, readFileSync, resolveMacrosAuto, writeFileSync} from "./utils.mjs";

export function readBlogMeta() {
    const meta = JSON.parse(readFileSync(srcDirName, "pages/meta.json"));
    BLOG.index.meta.title = meta.title;
    BLOG.index.meta.description = meta.description;
    BLOG.ad.AD_AFTER_EVERY_N_PAPER = meta.AD_AFTER_EVERY_N_PAPER;
    BLOG.ad.yandexAd.blockId = meta.blockId;
    BLOG.ad.yandexAd.renderTo = meta.renderTo;
    BLOG.ad.fallbackTitle = meta.adFallbackTitle;
}

export function generateIndex() {
    console.info("generateIndex: start");

    copyStaticAssets();
    generateAllShortHtml();
    insertAdInShortPages();
    BLOG.index.allShortPagesHtml = BLOG.index.allShortPagesHtml.join("\n");

    let data = readFileSync(srcDirName, "templates/index.html");
    data = resolveMacrosAuto(data, BLOG);
    writeFileSync(data, buildDirName, "index.html");

    console.info("generateIndex: finish");
}

function copyStaticAssets() {
    fs.copyFileSync(
        path.join(nodeModulesDirName, "highlight.js/styles/default.min.css"),
        path.join(buildDirName, "highlight-default.min.css")
    );
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
    fs.copyFileSync(
        path.join(srcDirName, "templates/reset.css"),
        path.join(buildDirName, "reset.css")
    );
    fs.cpSync(
        path.join(srcDirName, "templates/assets"),
        path.join(buildDirName, "assets"),
        {recursive: true}
    );
}

function generateAllShortHtml() {
    const pageShortItemTemplate = readFileSync(srcDirName, "templates/index_short-page-list-item.html");

    const sortedPages = sortBlogPages(BLOG.pages)

    const pagesSearchData = []
    for (let page of sortedPages) {
        const pageShortHtml = resolveMacrosAuto(pageShortItemTemplate, {...BLOG, GEN_page: page})
        BLOG.index.allShortPagesHtml.push(pageShortHtml);
        pagesSearchData.push({...page, raw: undefined, pageHtml: undefined});
    }

    BLOG.index.pagesSearchData = JSON.stringify(pagesSearchData)
        .replaceAll("\\n", " ")
        .replaceAll("\\r", " ")
        .replaceAll('\\"', " ")
        .replaceAll('\\', " ");
}

//sort by date
function sortBlogPages(pages) {
    const sortedPages = pages.sort((a, b) => {
        const dataA = parseRussianDate(a.meta.title, a.meta.date);
        const dataB = parseRussianDate(b.meta.title, b.meta.date);
        return dataB - dataA;
    })
    console.log("sortedPages order:");
    sortedPages.map(item => ({title: item.meta.title, date: item.meta.date})).forEach((item) => console.log(item));
    return sortedPages;
}

function insertAdInShortPages() {
    let pageShortItemAd = readFileSync(srcDirName, "templates/index_short-page-ad-list-item.html");
    pageShortItemAd = resolveMacrosAuto(pageShortItemAd, BLOG);

    const tmpArray = [];
    for (let i = 0; i < BLOG.index.allShortPagesHtml.length; ++i) {
        tmpArray.push(BLOG.index.allShortPagesHtml[i]);
        if (i === BLOG.ad.AD_AFTER_EVERY_N_PAPER || i === BLOG.pages.length - 1) {
            tmpArray.push(pageShortItemAd + "\n");
        }
    }
    BLOG.index.allShortPagesHtml = tmpArray;
}
