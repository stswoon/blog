/*
PageType = {
    raw: {
        data: string
        srcPageFileName: string
        srcPageDirName: string
        buildPageFileName: string
        buildPageDirName: string
    },

    link: string
    meta: {
        draft: boolean
        tags: string[]
        title: string,
        description: string
        firstImageSrc: string
        date: string
    }
    pageHtml: string
}
*/
export const BLOG = {
    index: {
        meta: {
            title: undefined,
            description: undefined,
        },
        indexHtml: undefined,
        indexShortPageListItemTemplateHtml: undefined,
    },
    footerHtml: undefined,
    ad: {
        AD_AFTER_EVERY_N_PAPER: 0,
        yandexAd: {
            blockId: undefined,
            renderTo: undefined,
            fallbackTitle: undefined
        },
        adBlockHtml: undefined,
        adHeadHtml: undefined,
    },
    pageTemplateHtml: undefined,
    pages: [],
};
