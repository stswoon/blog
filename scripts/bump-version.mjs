import fs from "node:fs";
import path from "path";

const packageJsonPath = path.join(import.meta.dirname, "..", "package.json");
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

const parts = pkg.version.split(".");
if (parts.length !== 3 || parts.some((part) => Number.isNaN(Number(part)))) {
    throw new Error(`Unsupported version format: ${pkg.version}`);
}

parts[2] = String(Number(parts[2]) + 1);
pkg.version = parts.join(".");

fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
console.log(`package.json version bumped to ${pkg.version}`);
