import fs from "node:fs";
import path from "path";
import fsp from "node:fs/promises";
import open from "open";

export const openInBrowser = () => open('build/index.html');


export const last = (arr) => arr[arr.length - 1];


export const readFileSync = (...pathItems) => fs.readFileSync(path.join(...pathItems), "utf8");

export const readFile = (...pathItems) => fsp.readFile(path.join(...pathItems), "utf8");

export const writeFileSync = (data, ...pathItems) => fs.writeFileSync(path.join(...pathItems), data, "utf8");

export const writeFile = (data, ...pathItems) => fsp.writeFile(path.join(...pathItems), data, "utf8");


// export function resolveSpecificMacros(text, name, value) {
//     return text.replaceAll(`{@blogEngine:${name}}`, value);
// }

/**
 * text: '{@blogEngine:ad.yandexAd.description} {@blogEngine:footerHtml}';
 * find: ad.yandexAd.description, footerHtml
 * replace onto: context.ad.yandexAd.description, context.footerHtml
 */
export function resolveMacrosAuto(text, context) {
    const regex = /{@blogEngine:(.*?)}/g;
    const matches = text.matchAll(regex) ?? [];
    for (const match of matches) {
        const macrosPath = match[1];
        const value = deepGet(context, macrosPath.split("."));
        //console.debug(`macrosPath=${macrosPath}, value=${value}`); // Output: ad.yandexAd.description, footerHtml
        text = text.replaceAll(`{@blogEngine:${macrosPath}}`, value);
    }
    return text;
}

// https://www.30secondsofcode.org/js/s/get-nested-object-value/
export const deepGet = (obj, keys) => keys.reduce((xs, x) => xs?.[x] ?? null, obj);

/**
 * 22 ноября 2024 -> Date
 */
export function parseRussianDate(dateStr) {
    if (!dateStr) {
        return new Date(0,0,0);
    }

    const months = {
        'января': 0,
        'февраля': 1,
        'марта': 2,
        'апреля': 3,
        'мая': 4,
        'июня': 5,
        'июля': 6,
        'августа': 7,
        'сентября': 8,
        'октября': 9,
        'ноября': 10,
        'декабря': 11
    };

    const parts = dateStr.split(' ');
    const day = parseInt(parts[0], 10);
    const month = months[parts[1].toLowerCase()];
    const year = parseInt(parts[2], 10);

    return new Date(year, month, day);
}

export function removeTags(str) {
    return str.replace(/<[^>]*>/g, '');
}