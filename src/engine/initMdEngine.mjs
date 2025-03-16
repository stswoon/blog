import markdownit from "markdown-it";
import hljs from "highlight.js";

console.info("init markdownit: start");

export const md = markdownit({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre><code class="hljs">' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          "</code></pre>"
        );
      } catch (cause) {
        console.error("highlight error: ", cause);
      }
    }
    return (
      '<pre><code class="hljs">' + md.utils.escapeHtml(str) + "</code></pre>"
    );
  },
});

//https://publishing-project.rivendellweb.net/customizing-markdown-it/
md.renderer.rules.image = function (tokens, idx, options, env, slf) {
  //   const token = tokens[idx];
  //   token.attrSet("class", "blogImage");
  const original = slf.renderToken(tokens, idx, options);
  return `<div class="blogImage_container">${original}</div>`;
};

console.info("init markdownit: finish");
