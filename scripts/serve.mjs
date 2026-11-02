import fs from "node:fs";
import path from "node:path";
import {spawn} from "node:child_process";
import {styleText} from "node:util";
import minimist from "minimist";

/**
 * Dev-режим: собирает сайт и пересобирает его при изменении файлов в src.
 *
 * Почему не `node --watch-path=./src`:
 * сборка копирует ассеты из src в build, то есть читает все файлы src. На NTFS
 * чтение обновляет LastAccessTime, а fs.watch на Windows отдаёт это как обычное
 * событие "change". Встроенный watch воспринимает его как правку файла и
 * перезапускает процесс — сборка запускается по кругу.
 *
 * Здесь fs.watch используется только как триггер: решение о пересборке
 * принимается по снимку mtime+size, поэтому изменения одного лишь atime
 * игнорируются.
 */

const projectDir = path.join(import.meta.dirname, "..");
const srcDir = path.join(projectDir, "src");
const engineEntry = path.join(projectDir, "blogengine.mjs");

const args = minimist(process.argv.slice(2));
const openInBrowser = args.open !== "false";

const DEBOUNCE_MS = 200;
const SETTLE_MS = 300;
const SETTLE_MAX_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 1000;

let stateSnapshot = new Map();
let building = false;
let queuedBuild = false;
let firstBuild = true;
let settleAttempts = 0;
let debounceTimer = null;
let watcher = null;
let pollTimer = null;

function shortPath(fullPath) {
    return path.relative(projectDir, fullPath);
}

/** path -> "mtimeMs:size". atime намеренно не учитывается. */
function takeSnapshot() {
    const snapshot = new Map();

    const walk = (dir) => {
        let entries;
        try {
            entries = fs.readdirSync(dir, {withFileTypes: true});
        } catch {
            return;
        }
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.isFile()) {
                try {
                    const stat = fs.statSync(fullPath);
                    snapshot.set(fullPath, `${stat.mtimeMs}:${stat.size}`);
                } catch {
                    // файл исчез между readdir и stat — не наша проблема
                }
            }
        }
    };

    walk(srcDir);
    return snapshot;
}

function diffSnapshots(prev, next) {
    const changed = [];
    for (const [file, signature] of next) {
        if (prev.get(file) !== signature) {
            changed.push(file);
        }
    }
    for (const file of prev.keys()) {
        if (!next.has(file)) {
            changed.push(file);
        }
    }
    return changed;
}

function describeChanges(changed) {
    const shown = changed.slice(0, 5).map(shortPath).join(", ");
    return changed.length > 5 ? `${shown} (+${changed.length - 5})` : shown;
}

function runEngine({open}) {
    return new Promise((resolve) => {
        const child = spawn(process.execPath, [engineEntry, `--open=${open}`], {
            cwd: projectDir,
            stdio: "inherit"
        });
        child.on("close", (code) => resolve(code ?? 0));
        child.on("error", (error) => {
            console.error(styleText("red", "fail to start blogengine"), error);
            resolve(1);
        });
    });
}

async function build() {
    if (building) {
        queuedBuild = true;
        return;
    }

    building = true;
    try {
        do {
            queuedBuild = false;
            const before = stateSnapshot;

            console.info(styleText("cyan", `\n=== build started at ${new Date().toLocaleTimeString()} ===`));
            const exitCode = await runEngine({open: firstBuild && openInBrowser});
            firstBuild = false;

            const after = takeSnapshot();
            stateSnapshot = after;

            if (exitCode !== 0) {
                console.error(styleText("red", `build failed, exit code ${exitCode}`));
            }

            const changedDuringBuild = diffSnapshots(before, after);
            if (changedDuringBuild.length > 0) {
                console.info(styleText("yellow", `changed during build: ${describeChanges(changedDuringBuild)}`));
                queuedBuild = true;
            }
        } while (queuedBuild);
    } finally {
        building = false;
    }

    console.info(styleText("green", "waiting for changes in src..."));
}

function checkForChanges() {
    debounceTimer = null;
    if (building) {
        // события во время сборки — это обновление atime от чтения ассетов;
        // настоящие правки поймает сравнение снимков после сборки
        return;
    }

    const next = takeSnapshot();
    const changed = diffSnapshots(stateSnapshot, next);
    if (changed.length === 0) {
        return;
    }

    // редактор может писать файл не атомарно: ждём, пока mtime "устоится",
    // иначе соберём сайт из наполовину записанного файла
    if (isStillBeingWritten(changed) && ++settleAttempts < SETTLE_MAX_ATTEMPTS) {
        scheduleCheck();
        return;
    }
    settleAttempts = 0;

    stateSnapshot = next;
    console.info(styleText("green", `change detected: ${describeChanges(changed)}`));
    void build();
}

function isStillBeingWritten(changed) {
    const now = Date.now();
    return changed.some((file) => {
        try {
            const stat = fs.statSync(file);
            return stat.isFile() && now - stat.mtimeMs < SETTLE_MS;
        } catch {
            // файл удалён — уже "устоялся"
            return false;
        }
    });
}

function scheduleCheck() {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(checkForChanges, DEBOUNCE_MS);
}

function startPolling(reason) {
    if (pollTimer) {
        return;
    }
    console.warn(styleText("yellow", `${reason}, falling back to polling every ${POLL_INTERVAL_MS}ms`));
    pollTimer = setInterval(scheduleCheck, POLL_INTERVAL_MS);
}

function startWatcher() {
    try {
        watcher = fs.watch(srcDir, {recursive: true}, scheduleCheck);
        watcher.on("error", (error) => {
            console.error(styleText("yellow", "watch error"), error);
            watcher?.close();
            watcher = null;
            startPolling("fs.watch stopped working");
        });
    } catch (error) {
        startPolling(`recursive fs.watch is not supported here (${error.message})`);
    }
}

function shutdown() {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    if (pollTimer) {
        clearInterval(pollTimer);
    }
    watcher?.close();
    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.info(styleText("cyan", `watching ${shortPath(srcDir)}`));
stateSnapshot = takeSnapshot();
startWatcher();
await build();
