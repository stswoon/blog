import fs from "node:fs";
import path from "path";
import {srcDirName} from "./constants.mjs";
import {BLOG_RESULT} from "./globals.mjs";
import {resolveSeveralMacros} from "./resolveMacros.mjs";

export function generateAd() {
    console.info("generateAd: start");
    const adMacrosData = {
        "ad_description": BLOG_RESULT.meta.yandexAd.description,
        "ad_blockId": BLOG_RESULT.meta.yandexAd.blockId,
        "ad_renderTo": BLOG_RESULT.meta.yandexAd.renderTo
    }
    BLOG_RESULT.adHeadHtml = fs.readFileSync(path.join(srcDirName, "templates/ad-head.html"), "utf8");
    BLOG_RESULT.adHeadHtml = resolveSeveralMacros(BLOG_RESULT.adHeadHtml, adMacrosData);
    BLOG_RESULT.adBlockHtml = fs.readFileSync(path.join(srcDirName, "templates/ad-block.html"), "utf8");
    BLOG_RESULT.adBlockHtml = resolveSeveralMacros(BLOG_RESULT.adBlockHtml, adMacrosData);
    console.info("generateAd: finish");
}
