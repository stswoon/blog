// /**
//  * text: '{@blogEngine:ad-head} {@blogEngine:banner} {@blogEngine:footer}';
//  * find: ad-head, banner, footer
//  */
// export function resolveMacros(text) {
//     const regex = /{@blogEngine:(.*?)}/g;
//     let match;
//     while ((match = regex.exec(text)) !== null) {
//         console.log(match[1]); // Output: ad-head, banner, footer
//     }
// }

export function resolveSpecificMacros(text, name, value) {
    return text.replaceAll("{@blogEngine:" + name + "}", value);
}

export function resolveSeveralMacros(text, nameValueMap) {
    Object.keys(nameValueMap).forEach(name => {
        text = text.replaceAll("{@blogEngine:" + name + "}", nameValueMap[name]);
    })
    return text;
}