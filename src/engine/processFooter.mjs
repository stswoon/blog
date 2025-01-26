import fs from "node:fs";
import path from "path";
import {srcDirName} from "./constants.mjs";
import {BLOG_RESULT} from "./globals.mjs";

export function generateFooter() {
    console.info("generateFooter: start");
    BLOG_RESULT.footerHtml = fs.readFileSync(path.join(srcDirName, "templates/footer.html"), "utf8")
    console.info("generateIndex: finish");
}
