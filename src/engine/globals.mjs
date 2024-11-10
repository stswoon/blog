export let BLOG_RESULT = {
  meta: {},
  pages: [],
};

export function clearBlogResult() {
  BLOG_RESULT.meta = {};
  BLOG_RESULT.pages = [];
}
