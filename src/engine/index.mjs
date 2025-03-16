import fs from "node:fs";
import path from "path";
import minimist from "minimist";
import {buildDirName} from "./constants.mjs";
import {generatePages} from "./processPages.mjs";
import {generateIndex, readBlogMeta} from "./processIndex.mjs";
import {openInBrowser} from "./openInBrowser.mjs";
import {generateFooter} from "./processFooter.mjs";
import {generateAd} from "./processAd.mjs";
import {styleText} from "node:util";

export const runBlogEngine = async () => {
    console.info("runBlogEngine: start");
    try {
        const args = minimist(process.argv.slice(2));
        console.debug("args:", args);

        clearAndCreateBuildDir();

        readBlogMeta();
        generateFooter();
        generateAd();
        generatePages();
        generateIndex();

        console.info(styleText('green', `You can open result in browser file://${buildDirName.replaceAll('\\', '/')}/index.html`));
        if (!(args.open === 'false')) {
            console.info("runBlogEngine: opening in browser");
            await openInBrowser();
        }

        console.info("runBlogEngine: finish");
        console.info(styleText('green', "runBlogEngine: SUCCESS"));
    } catch (e) {
        console.error(styleText('red', "Fail to execute runBlogEngine()"), e);
    }
};

function clearAndCreateBuildDir() {
    if (fs.existsSync(buildDirName)) {
        fs.rmSync(buildDirName, {recursive: true, force: true});
    }
    fs.mkdirSync(buildDirName);
    fs.mkdirSync(path.join(buildDirName, "assets"));
}
