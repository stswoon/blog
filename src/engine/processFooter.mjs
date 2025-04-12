import {srcDirName} from "./constants.mjs";
import {BLOG} from "./globals.mjs";
import {readFileSync} from "./utils.mjs";

export function generateFooter() {
    console.info("generateFooter: start");
    BLOG.footerHtml = readFileSync(srcDirName, "templates/footer.html");
    console.info("generateFooter: finish");
}
