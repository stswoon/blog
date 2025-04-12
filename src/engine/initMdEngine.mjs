import markdownit from "markdown-it";
import hljs from "highlight.js";

console.info("init markdownit: start");

export const md = markdownit({
    highlight: function (str, lang) {
        let code = md.utils.escapeHtml(str);
        if (lang && hljs.getLanguage(lang)) {
            try {
                code = hljs.highlight(str, {language: lang, ignoreIllegals: true}).value
            } catch (cause) {
                console.error("highlight error: ", cause);
            }
        }
        const langClass = lang ? `language-${lang}` : "";
        return `<pre><code class="hljs ${langClass}">${code}</code></pre>`;
    },
});

//https://publishing-project.rivendellweb.net/customizing-markdown-it/
md.renderer.rules.image = function (tokens, idx, options, env, slf) {
    //   const token = tokens[idx];
    //   token.attrSet("class", "blogImage");
    const original = slf.renderToken(tokens, idx, options);
    return `<div class="blogImage_container">${original}</div>`;
};

// md.renderer.rules.fence  = function (tokens, idx, options, env, slf) {
//   const token = tokens[idx];
//   const langClass = token.info ? `language-${md.utils.escapeHtml(token.info)}` : "";
//   const original = slf.renderToken(tokens, idx, options);
//   return `<div class="blogEngine_codeBlockContainer ${langClass}">${original}</div>`;
// };

console.info("init markdownit: finish");
