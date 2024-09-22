
import markdownit from 'markdown-it';
import fs from 'node:fs';
import path from 'path';

console.info('init engine...');

const md = markdownit();
const basePath = path.join(import.meta.dirname, "../../src");
console.log("basePath=" + basePath);

console.info('finish init engine...');

export const engine = () => {
    console.info('run engine...');

    let blogModel = fs.readFileSync(path.join(basePath, '/pages/blog-model.json'), 'utf8');
    console.log(blogModel);
    blogModel = JSON.parse(blogModel);

    for (let pagePath of blogModel.pages) {
        pageGeneration(pagePath);
    }
    
    console.info('finish engine...');
}

function pageGeneration(pagePath) {
    console.info('generating ' + pagePath);
    const pageData = fs.readFileSync(path.join(basePath, 'pages', pagePath), 'utf8');
    const result = md.render(pageData);
    console.log(result);
}