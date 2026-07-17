import {appendVersionToStaticUrl, resolveMacrosAuto} from "../src/engine/utils.mjs";

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