import path from "path";

console.log("import.meta.dirname=" + import.meta.dirname);

export const srcDirName = path.join(import.meta.dirname, "../../src");
console.log("srcDirName=" + srcDirName);

export const buildDirName = path.join(srcDirName, "../build");
export const nodeModulesDirName = path.join(srcDirName, "../node_modules");
