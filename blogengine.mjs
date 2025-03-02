import { runBlogEngine } from "./src/engine/index.mjs";

try {
    await runBlogEngine();
} catch (e) {
    console.error("Fail to execute runBlogEngine()", e);
}