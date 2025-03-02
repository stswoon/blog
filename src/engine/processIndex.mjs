import path from "path";
import fs from "node:fs";
import {BLOG_RESULT} from "./globals.mjs";
import {srcDirName, nodeModulesDirName, buildDirName} from "./constants.mjs";
import {md} from "./init-md.mjs";
import {resolveSeveralMacros, resolveSpecificMacros} from "./resolveMacros.mjs";

export function generateIndex() {
    console.info("generateIndex: start");

    copyStaticAssets();

    // const tocHtml = generateTocHtml();
    // const last5Html = generateLast5Html();
    const allShortHtml = generateAllShortHtml();

    let data = fs.readFileSync(
        path.join(srcDirName, "templates/index.html"),
        "utf8"
    );
    data = resolveSpecificMacros(data, "allShortHtml", allShortHtml);
    // data = resolveSpecificMacros(data, "last_5", last5Html);
    // data = resolveSpecificMacros(data, "menu", tocHtml);
    data = resolveSpecificMacros(data, "title", BLOG_RESULT.meta.title);
    data = resolveSpecificMacros(data, "description", BLOG_RESULT.meta.description);
    data = resolveSpecificMacros(data, "ad_head", BLOG_RESULT.adHeadHtml);
    // data = resolveSpecificMacros(data, "ad_block", BLOG_RESULT.adBlockHtml);
    data = resolveSpecificMacros(data, "footer", BLOG_RESULT.footerHtml);
    data = resolveSpecificMacros(data, "papersSearchData", generatePaperSearchData());
    fs.writeFileSync(path.join(buildDirName, "index.html"), data, "utf-8");

    console.info("generateIndex: finish");
}

const AFTER_PAPER_AD = 5;

function generateAllShortHtml() {
    const paperItem = fs.readFileSync(path.join(srcDirName, "templates/index_paper-item.html"), "utf8");

    let result = "";
    for (let i = 0; i < BLOG_RESULT.pages.length; ++i) {
        const pageData = BLOG_RESULT.pages[i]
        const paperMacrosData = {
            "page_id": pageData.link,
            "page_short_html": pageData.shortHtml,
            "page_link": pageData.link,
            "page_short_image": pageData.shortImage,
        }
        result += resolveSeveralMacros(paperItem, paperMacrosData) + "\n";

        if (i === AFTER_PAPER_AD || i === BLOG_RESULT.pages.length - 1) {
            let adHtml = '<div class="paper-item ad">{@blogEngine:ad_block}</div>';
            adHtml = resolveSpecificMacros(adHtml, "ad_block", BLOG_RESULT.adBlockHtml);
            result += adHtml + "\n";
        }
    }
    // console.log("result=", result);
    return result;
}

// function generateLast5Html() {
//     const paperItem = fs.readFileSync(path.join(srcDirName, "templates/index_paper-item.html"), "utf8");
//
//     let result = "";
//     for (let i = 0; i < Math.min(BLOG_RESULT.pages.length, 5); ++i) {
//         const pageData = BLOG_RESULT.pages[i]
//         const paperMacrosData = {
//             "page_id": pageData.link,
//             "page_short_html": pageData.shortHtml,
//             "page_link": pageData.link
//         }
//         result += resolveSeveralMacros(paperItem, paperMacrosData) + "\n";
//     }
//     // console.log("result=", result);
//     return result;
// }

// //TODO: make md generation, then html replace because this function also need in page
// function generateTocHtml() {
//     //console.log("blogResultModel=", blogResultModel);
//     let tocMd = "";
//     for (const page of BLOG_RESULT.pages) {
//         const title = new Date(page.date).getFullYear() + ": " + page.title;
//         tocMd += `* [${title}](${page.link})` + "\n";
//     }
//     const tocHtml = md.render(tocMd);
//     //console.log("tocHtml=", tocHtml);
//     return tocHtml;
// }

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

export function getBlogMeta() {
    const meta = fs.readFileSync(path.join(srcDirName, "pages/blog-meta.json"), "utf8");
    return JSON.parse(meta);
}

function generatePaperSearchData() {
    const papersSearchData = BLOG_RESULT.pages.map(page => {
        return {
            id: page.link,
            link: page.link,
            title: page.title,
            description: page.description,
            tags: page.tags,
            html: encodeURI(page.html),
            // source: page.source,
        }
    });
    return JSON.stringify(papersSearchData);
}