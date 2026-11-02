import {appendVersionToStaticUrl, resolveMacrosAuto, wrapTablesInScrollContainer} from "../src/engine/utils.mjs";

describe("resolveMacrosAuto", () => {
    const context = {
        a: 1,
        b: {ba: 2}
    };

    it("and so is a spec", () => {
        const text = "a={@blogEngine:a}, b.ba={@blogEngine:b.ba}";
        const er = "a=1, b.ba=2";
        const ar = resolveMacrosAuto(text, context);
        expect(ar).toBe(er);
    })
});

describe("appendVersionToStaticUrl", () => {
    it("appends version query param to local assets", () => {
        expect(appendVersionToStaticUrl("./style.css", "1.0.3")).toBe("./style.css?v=1.0.3");
    });

    it("keeps external urls unchanged", () => {
        expect(appendVersionToStaticUrl("https://example.com/a.png", "1.0.3")).toBe("https://example.com/a.png");
    });
});

describe("wrapTablesInScrollContainer", () => {
    it("wraps a plain table", () => {
        const html = "<p>a</p><table><tr><td>x</td></tr></table>";
        expect(wrapTablesInScrollContainer(html))
            .toBe('<p>a</p><div class="table-scroll"><table><tr><td>x</td></tr></table></div>');
    });

    it("keeps table attributes", () => {
        const wrapped = wrapTablesInScrollContainer('<table style="max-width: 800px;"><tr><td>x</td></tr></table>');
        expect(wrapped).toBe('<div class="table-scroll"><table style="max-width: 800px;"><tr><td>x</td></tr></table></div>');
    });

    it("wraps every table on the page", () => {
        const wrapped = wrapTablesInScrollContainer("<table><tr><td>1</td></tr></table><p>b</p><table><tr><td>2</td></tr></table>");
        expect(wrapped.split('class="table-scroll"').length - 1).toBe(2);
    });

    it("leaves html without tables untouched", () => {
        const html = "<p>no tables here</p>";
        expect(wrapTablesInScrollContainer(html)).toBe(html);
    });
});