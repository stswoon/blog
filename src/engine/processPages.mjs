import fs from "node:fs";
import path from "path";
import {globSync} from "glob";
import {styleText} from 'node:util';
import {md} from "./initMdEngine.mjs";
import {srcDirName, buildDirName} from "./constants.mjs";
import {BLOG} from "./globals.mjs";
import {readFile, resolveMacrosAuto, resolveSpecificMacros, writeFile} from "./utils.mjs";
import fsp from "node:fs/promises";

export async function generatePages() {
    console.info("generatePages: start");
    BLOG.pageTemplateHtml = readFile(srcDirName, "templates/index-page.html");
    await readPages();
    for (let page of BLOG.pages) {
        pageGeneration(page);
    }
    await writePages();
    console.info("generatePages: finish");
}

function readPages() {
    const fileNames = globSync(srcDirName + "/pages/*/*/index.md", {});
    // console.debug("fileNames:", fileNames);

    return Promise.all(fileNames.map(fileName => {
        console.log(`read ${fileName}`);
        let srcPageFileName = fileName.substring(fileName.indexOf("src") + 3) //cut all to first 'src' for Windows and for Docker
        srcPageFileName = path.join(srcDirName, srcPageFileName);
        return readFile(fileName).then(data => {
            BLOG.pages.push({
                raw: {data, srcPageFileName}
            });
        });
    }));
}

function writePages() {
    return Promise.all(BLOG.pages.map(page => {
        console.log(`write ${page.buildPageFileName}`);
        if (page.meta.draft) {
            return Promise.resolve();
        }
        fsp.mkdir(page.buildPageDirName, {recursive: true})
            .then(() => copyStaticAssets(page.srcPageDirName, page.buildPageDirName))
            .then(() => writeFile(page.pageHtml, page.buildPageFileName))
    }));
}

function copyStaticAssets(srcPageDirName, buildPageDirName) {
    // fs.copyFileSync(sourcePageFolderName + "/*.*", resultFolderName);
    return fsp.cp(srcPageDirName, buildPageDirName, {
        recursive: true,
        filter: (src, dest) => {
            return !src.endsWith(".md");
        }
    });
}

function pageGeneration(page) {
    try {
        console.log(`generating ${page.srcPageDirName}`);
        fillMeta(page);
        if (page.meta.draft) {
            console.warn(styleText('yellow', `Page ${page.srcPageDirName} is skipped because of draft flag`));
            return;
        }
        fillPageDirs(page);
        fillPageLink(page);
        fillHtml(page);
    } catch (e) {
        console.error(`Fail in ${page}`, e);
        throw e;
    }
}

function fillPageDirs(page) {
    page.srcPageDirName = path.join(page.srcPageFileName, "..");
    page.buildPageFileName = page.srcPageFileName
        .replace(srcDirName, buildDirName)
        .replace(".md", ".html")
    page.buildPageDirName = path.join(buildPageFileName, "..");
}

function fillPageLink(page) {
    const link = page.buildPageDirName
        .replace(buildDirName, "")
        .substring(1)
        .replaceAll("\\", "/");
    console.log("link=" + link);
    page.link = link;
}

function fillMeta(page) {
    const meta = getPageMeta(page.raw.data);
    page.meta = {
        draft: meta.draft,
        tags: meta.tags
    }
}

function getPageMeta(text) {
    const match = text.match(/<!--(.*?)-->/gs);
    if (!match) {
        console.debug("no meta for page");
        return {};
    } else {
        return JSON.parse(match[1]);
    }
}

function removeComments(text) {
    return text.replace(/<!--.*?-->/gs, "");
}

function fillHtml(page) {
    const pageData = removeComments(page.raw.data);

    page.meta.title
    page.meta.description

    page.pageHtml = md.render(pageData);
    // console.debug("pageHtml:",  page.pageHtml);
    page.meta.firstImageSrc = getFirstImgLink(page.pageHtml, page.link);
    page.meta.date = getDate(page.pageHtml);
    page.meta.description = getFirstParagraph(page.pageHtml);
    // page.meta.description = generatePageShortHtml(page.pageHtml);

    page.pageHtml = resolveMacrosAuto(BLOG.pageTemplateHtml, {...BLOG, GEN_page: page});
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

function generatePageShortHtml(pageData) {
    //TODO:anneq
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