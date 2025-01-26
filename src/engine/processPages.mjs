import fs from "node:fs";
import path from "path";
import {globSync} from "glob";
import {md} from "./init-md.mjs";
import {srcDirName, buildDirName} from "./constants.mjs";
import {BLOG_RESULT} from "./globals.mjs";
import {resolveSpecificMacros} from "./resolveMacros.mjs";

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

    const link = buildPageFileName
        .replaceAll(buildDirName, "")
        .substring(1)
        .replaceAll("\\", "/");
    console.log("link=" + link);

    fs.mkdirSync(buildPageDirName, {recursive: true});

    copyStaticAssets(srcPageDirName, buildPageDirName);

    const pageHtml = generatePageHtml(path.join(srcPageDirName, meta.fileName));
    const shortHtml = generatePageHtml(path.join(srcPageDirName, meta.fileName), true);
    BLOG_RESULT.pages.push({
        meta,
        link,
        html: pageHtml,
        shortHtml: shortHtml
    });

    let data = fs.readFileSync(path.join(srcDirName, "templates/paper.html"), "utf8");
    data = resolveSpecificMacros(data, "page_title", meta.title);
    data = resolveSpecificMacros(data,"page_description", meta.description);
    data = resolveSpecificMacros(data,"page_html", pageHtml);
    data = resolveSpecificMacros(data,"ad_head", BLOG_RESULT.adHeadHtml);
    data = resolveSpecificMacros(data,"ad_block", BLOG_RESULT.adBlockHtml);
    data = resolveSpecificMacros(data,"footer", BLOG_RESULT.footerHtml);
    fs.writeFileSync(buildPageFileName, data, "utf-8");
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
