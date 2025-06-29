import fs from "node:fs";
import path from "path";
import minimist from "minimist";
import {buildDirName} from "./constants.mjs";
import {generatePages} from "./processPages.mjs";
import {generateIndex, readBlogMeta} from "./processIndex.mjs";
import {generateFooter} from "./processFooter.mjs";
import {generateAd, generateMetrica} from "./processAd.mjs";
import {styleText} from "node:util";
import {openInBrowser} from "./utils.mjs";

export const runBlogEngine = async () => {
    try {
        console.info("runBlogEngine: start");

        const args = minimist(process.argv.slice(2));
        console.debug("args:", args);

        clearAndCreateBuildDir();

        readBlogMeta();
        generateFooter();
        generateAd();
        generateMetrica();
        await generatePages();
        generateIndex();

        console.info("runBlogEngine: finish");

        console.info(styleText('green', `You can open result in browser file://${buildDirName.replaceAll('\\', '/')}/index.html`));
        if (!(args.open === 'false')) {
            console.info("runBlogEngine: opening in browser");
            await openInBrowser();
        }
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
