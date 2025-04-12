import path from "path";
import {globSync} from "glob";
import {styleText} from 'node:util';
import {md} from "./initMdEngine.mjs";
import {buildDirName, srcDirName} from "./constants.mjs";
import {BLOG} from "./globals.mjs";
import {readFile, readFileSync, removeTags, resolveMacrosAuto, writeFile} from "./utils.mjs";
import fsp from "node:fs/promises";
import {JSDOM} from "jsdom";

export async function generatePages() {
    console.info("generatePages: start");
    await readPages();
    const pageTemplateHtml = readFileSync(srcDirName, "templates/index-page.html");
    for (let page of BLOG.pages) {
        pageGeneration(page, pageTemplateHtml);
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
        console.log(`write ${page.raw.buildPageFileName}`);
        if (page.meta.draft) {
            return Promise.resolve();
        }
        fsp.mkdir(page.raw.buildPageDirName, {recursive: true})
            .then(() => copyStaticAssets(page.raw.srcPageDirName, page.raw.buildPageDirName))
            .then(() => writeFile(page.pageHtml, page.raw.buildPageFileName))
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

function pageGeneration(page, pageTemplateHtml) {
    try {
        console.log(`generating ${page.raw.srcPageFileName}`);
        fillMeta(page);
        if (page.meta.draft) {
            console.warn(styleText('yellow', `Page ${page.raw.srcPageDirName} is skipped because of draft flag`));
            return;
        }
        fillPageDirs(page);
        fillPageLink(page);
        fillHtml(page, pageTemplateHtml);
        fillSearchData(page);
    } catch (e) {
        console.error(`Fail in ${page}`, e);
        throw e;
    }
}

function fillPageDirs(page) {
    page.raw.srcPageDirName = path.join(page.raw.srcPageFileName, "..");
    page.raw.buildPageFileName = page.raw.srcPageFileName
        .replace(srcDirName, buildDirName)
        .replace(".md", ".html")
    page.raw.buildPageDirName = path.join(page.raw.buildPageFileName, "..");
}

function fillPageLink(page) {
    let link = page.raw.buildPageDirName
        .replace(buildDirName, "")
        .substring(1)
        .replaceAll("\\", "/");
    link += "/index.html";
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
    text = text.replaceAll("\r\n", "\n");
    const match = text.match(/<!--(.*?)-->/gs);
    if (!match) {
        console.debug("no meta for page");
        return {};
    } else {
        // return JSON.parse(match[1]);
        return JSON.parse(match[0].replace("<!--","").replaceAll("-->",""));
    }
}

function removeComments(text) {
    return text.replace(/<!--.*?-->/gs, "");
}

function fillSearchData(page) {
    page.pageSearchData = removeComments(page.raw.data);
}

function fillHtml(page, pageTemplateHtml) {
    const pageData = removeComments(page.raw.data);
    const pageContentHtml = md.render(pageData);
    // console.debug("pageContentHtml:",  pageContentHtml);

    const jsDom = new JSDOM("<!DOCTYPE html>" + pageContentHtml);
    const jsDomDocument = jsDom.window.document;
    page.meta.title = jsDomDocument.querySelector('h1').innerHTML;
    page.meta.description = removeTags(jsDomDocument.querySelectorAll('p')?.[1].innerHTML);
    page.meta.firstImageSrc = getSafeImgLink(jsDomDocument.querySelector('img')?.src, page.link);
    page.meta.date = jsDomDocument.querySelector('.language-blogEnginePageDate')?.innerHTML;

    page.pageHtml = resolveMacrosAuto(pageTemplateHtml, {
        ...BLOG,
        GEN_page: {...page, pageContentHtml}
    });
}

function getSafeImgLink(imgSrc, pageLink) {
    if (!imgSrc) {
        return "./assets/fallbackBlogImg.png";
    }
    const baseLink = pageLink.substring(0, pageLink.lastIndexOf("/"));
    return `${baseLink}/${imgSrc}`;
}