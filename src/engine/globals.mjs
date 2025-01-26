/*
BlogMetaType = {
  "title": string,
  "description": string,
  "yandexAd": {
    "blockId": string,
    "renderTo": string,
    "fallbackDescription": string; //"Пожалуйста, отключите ад-блок"
  }
}

PageType = {
  meta: {
    "title": string,
    "description": string,
    "publish": boolean,
    "date": "2024-11-10T09:34:15Z",
    "fileName": "./test-paper.md"
  }
  link: string
  html: string
  shortHtml: string
}
*/
export let BLOG_RESULT = {
    meta: {},
    pages: [],
};

export function clearBlogResult() {
    BLOG_RESULT.meta = {};
    BLOG_RESULT.pages = [];
    BLOG_RESULT.footerHtml = "";
    BLOG_RESULT.adBlockHtml = "";
    BLOG_RESULT.adHeadHtml = "";
}
