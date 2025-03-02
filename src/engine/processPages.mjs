import fs from "node:fs";
import path from "path";
import {globSync} from "glob";
import {styleText} from 'node:util';
import {md} from "./init-md.mjs";
import {srcDirName, buildDirName} from "./constants.mjs";
import {BLOG_RESULT} from "./globals.mjs";
import {resolveSpecificMacros} from "./resolveMacros.mjs";

export function generatePages() {
    console.info("generatePages: start");

    const fileNames = globSync(srcDirName + "/pages/*/*/meta.json", {});
    console.log("fileNames:", fileNames);

    for (let fileName of fileNames) {
        fileName = fileName.substring(fileName.indexOf("src") + 3) //cut all to first 'src' for Windows and for Docker
        fileName = path.join(srcDirName, fileName);
        pageGeneration(path.join(fileName, ".."));
    }

    console.info("generatePages: finish");
}

function getFirstImgLink(pageHtml, link) {
    const regex = /<img.*src="(.*?)".*>/;
    const result = regex.exec(pageHtml);
    const firstImgLink = result && result[1];
    console.log("firstImgLink=", firstImgLink);
    if (!firstImgLink) {
        return "./assets/fallbackBlogImg.png";
    }
    const baseLink = link.substring(0, link.lastIndexOf("/"));
    return `${baseLink}/${firstImgLink}`;
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

    const srcPageFileName = path.join(srcPageDirName, meta.fileName)
    const pageHtml = generatePageHtml(srcPageFileName);
    const shortHtml = generatePageShortHtml(srcPageFileName);
    const shortImageSrc = getFirstImgLink(pageHtml, link);
    BLOG_RESULT.pages.push({
        meta,
        link,
        html: pageHtml,
        shortHtml: shortHtml,
        title: meta.title,
        description: meta.description,
        id: link,
        shortImage: shortImageSrc
        // source: getSource(srcPageFileName)
    });

    let data = fs.readFileSync(path.join(srcDirName, "templates/paper.html"), "utf8");
    data = resolveSpecificMacros(data, "title", BLOG_RESULT.meta.title);
    data = resolveSpecificMacros(data, "page_title", meta.title);
    data = resolveSpecificMacros(data, "page_description", meta.description);
    data = resolveSpecificMacros(data, "page_html", pageHtml);
    data = resolveSpecificMacros(data, "ad_head", BLOG_RESULT.adHeadHtml);
    data = resolveSpecificMacros(data, "ad_block", BLOG_RESULT.adBlockHtml);
    data = resolveSpecificMacros(data, "footer", BLOG_RESULT.footerHtml);
    fs.writeFileSync(buildPageFileName, data, "utf-8");
}

function generatePageShortHtml(srcPageFileName) {
    let pageData = fs.readFileSync(srcPageFileName, "utf8");
    let pageShortHtml;
    pageData = pageData.replaceAll("\r\n", "\n");
    let firstParagraphEnd = pageData.indexOf("\n\n");
    let secondParagraphEnd = pageData.indexOf("\n\n", firstParagraphEnd + 1);
    let thirdParagraphEnd = pageData.indexOf("\n\n", secondParagraphEnd + 1);
    if (thirdParagraphEnd === -1) {
        console.warn(styleText(
            'yellowBright',
            `Cannot find third paragraph in parer so it cause display all paper in index page. Warning for paper: ${srcPageFileName}`
        ));
    } else {
        pageData = pageData.substring(0, thirdParagraphEnd);
    }
    pageShortHtml = md.render(pageData);
    // console.log("pageShortHtml:", pageHtml);
    return pageShortHtml;
}

function generatePageHtml(srcPageFileName) {
    let pageData = fs.readFileSync(srcPageFileName, "utf8");
    let pageHtml = md.render(pageData);
    // console.log("pageHtml:", pageHtml);
    return pageHtml;
}

function getSource(srcPageFileName) {
    return fs.readFileSync(srcPageFileName, "utf8");
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
