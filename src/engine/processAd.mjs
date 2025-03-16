import {srcDirName} from "./constants.mjs";
import {BLOG} from "./globals.mjs";
import {readFileSync, resolveMacrosAuto} from "./utils.mjs";

export function generateAd() {
    console.info("generateAd: start");
    BLOG.adHeadHtml = readFileSync(srcDirName, "templates/ad-head.html");
    BLOG.adHeadHtml = resolveMacrosAuto(BLOG.adHeadHtml, BLOG);
    BLOG.adBlockHtml = readFileSync(srcDirName, "templates/ad-block.html");
    BLOG.adBlockHtml = resolveMacrosAuto(BLOG.adBlockHtml, BLOG);
    console.info("generateAd: finish");
}
