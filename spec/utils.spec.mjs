import {resolveMacrosAuto} from "../src/engine/utils.mjs";

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