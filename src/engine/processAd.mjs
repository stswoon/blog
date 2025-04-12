import {srcDirName} from "./constants.mjs";
import {BLOG} from "./globals.mjs";
import {readFileSync, resolveMacrosAuto} from "./utils.mjs";

export function generateAd() {
    console.info("generateAd: start");
    BLOG.ad.adHeadHtml = readFileSync(srcDirName, "templates/ad-head.html");
    BLOG.ad.adHeadHtml = resolveMacrosAuto(BLOG.ad.adHeadHtml, BLOG);
    BLOG.ad.adBlockHtml = readFileSync(srcDirName, "templates/ad-block.html");
    BLOG.ad.adBlockHtml = resolveMacrosAuto(BLOG.ad.adBlockHtml, BLOG);
    console.info("generateAd: finish");
}
