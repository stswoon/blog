import path from "path";
import fs from "node:fs";
import {BLOG} from "./globals.mjs";
import {srcDirName, nodeModulesDirName, buildDirName} from "./constants.mjs";
import {parseRussianDate, readFileSync, resolveMacrosAuto, writeFileSync} from "./utils.mjs";
import {md} from "./initMdEngine.mjs";

export function readBlogMeta() {
    const meta = JSON.parse(readFileSync(srcDirName, "pages/meta.json"));
    BLOG.index.meta.title = meta.title;
    BLOG.index.meta.description = meta.description;
    BLOG.ad.AD_AFTER_EVERY_N_PAPER = meta.AD_AFTER_EVERY_N_PAPER;
    BLOG.ad.yandexAd.blockId = meta.yandexAd.blockId;
    BLOG.ad.yandexAd.renderTo = meta.yandexAd.renderTo;
    BLOG.ad.fallbackTitle = meta.adFallbackTitle;
}

export function generateIndex() {
    console.info("generateIndex: start");

    copyStaticAssets();
    const sortedPages = sortBlogPages(BLOG.pages)
    generateAllShortHtml(sortedPages);
    // insertAdInShortPages();
    BLOG.index.allShortPagesHtml = BLOG.index.allShortPagesHtml.join("\n");
    generateToc(sortedPages);

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

function generateAllShortHtml(sortedPages) {
    const pageShortItemTemplate = readFileSync(srcDirName, "templates/index_short-page-list-item.html");

    const pagesSearchData = []
    for (let i = 0; i < sortedPages.length; ++i) {
        const page = sortedPages[i];
        let pageShortHtml = resolveMacrosAuto(pageShortItemTemplate, {...BLOG, GEN_page: page});
        if (i >= BLOG.ad.AD_AFTER_EVERY_N_PAPER) {
            pageShortHtml = pageShortHtml.replace('<div class="paper-item"', '<div class="paper-item hidden"')
        }
        BLOG.index.allShortPagesHtml.push(pageShortHtml);
        pagesSearchData.push({...page, raw: undefined, pageHtml: undefined});
    }

    BLOG.index.pagesSearchData = JSON.stringify(pagesSearchData)
        .replaceAll("\\n", " ")
        .replaceAll("\\r", " ")
        .replaceAll('\\"', " ")
        .replaceAll('\\', " ")
        .replaceAll('<', " ")
        .replaceAll('>', " ")
        .replaceAll('```', " ")
    // BLOG.index.pagesSearchData = encodeURIComponent(BLOG.index.pagesSearchData);
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

// function insertAdInShortPages() {
//     let pageShortItemAd = readFileSync(srcDirName, "templates/index_short-page-ad-list-item.html");
//     pageShortItemAd = resolveMacrosAuto(pageShortItemAd, BLOG);
//
//     const tmpArray = [];
//     for (let i = 0; i < BLOG.index.allShortPagesHtml.length; ++i) {
//         tmpArray.push(BLOG.index.allShortPagesHtml[i]);
//         if (i === BLOG.ad.AD_AFTER_EVERY_N_PAPER || i === BLOG.pages.length - 1) {
//             tmpArray.push(pageShortItemAd + "\n");
//         }
//     }
//     BLOG.index.allShortPagesHtml = tmpArray;
// }

function generateToc(sortedPages) {
    let toc = "";

    let lastYear;
    sortedPages.forEach(item => {
        const currentYear = parseRussianDate(item.meta.title, item.meta.date).getFullYear();
        if (currentYear !== lastYear) {
            lastYear = currentYear;
            toc += `\n#### ${currentYear}\n\n`;
        }
        toc += `* [${item.meta.title}](${item.link})\n`;
    })

    const tocHtml = md.render(toc);
    BLOG.index.toc = tocHtml;
}
