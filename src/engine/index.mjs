import fs from "node:fs";
import path from "path";
import minimist from "minimist";
import {buildDirName} from "./constants.mjs";
import {BLOG_RESULT} from "./globals.mjs";
import {clearBlogResult} from "./globals.mjs";
import {generatePages} from "./processPages.mjs";
import {generateIndex, getBlogMeta} from "./processIndex.mjs";
import {openInBrowser} from "./openInBrowser.mjs";
import {generateFooter} from "./processFooter.mjs";
import {generateAd} from "./processAd.mjs";

export const runBlogEngine = async () => {
    console.info("runBlogEngine: start");

    const args = minimist(process.argv.slice(2));
    console.debug("args:", args);

    clearBlogResult();
    clearAndCreateBuildDir();

    BLOG_RESULT.meta = getBlogMeta();
    generateFooter();
    generateAd();
    generatePages();
    generateIndex();

    console.info("runBlogEngine: finish");

    if (!(args.open === 'false')) {
        console.info("runBlogEngine: open in browser");
        await openInBrowser();
    }

    console.info("runBlogEngine: SUCCESS");
};

function clearAndCreateBuildDir() {
    if (fs.existsSync(buildDirName)) {
        fs.rmSync(buildDirName, {recursive: true, force: true});
    }
    fs.mkdirSync(buildDirName);
    fs.mkdirSync(path.join(buildDirName, "assets"));
}
