import * as PIXI from "pixi.js";
import { applyContainerPolyfill } from "./containerPolyfill";
import { applyDisplayObjectPolyfill } from "./displayObjectPolyfill";
import { yogaAnimationManager } from "./YogaAnimationManager";
if (!window.PIXI) {
    window.PIXI = PIXI;
}
import { YogaLayout } from "./YogaLayout";
export { YogaLayout } from "./YogaLayout";
export * from "./YogaContants";
/**
 * Polyfills PIXI.DisplayObject and PIXI.Container
 *
 */
export function initializeYogaLayout(options = { usePixiSharedTicker: true }) {
    applyDisplayObjectPolyfill();
    applyContainerPolyfill();
    if (options.usePixiSharedTicker) {
        PIXI.Ticker.shared.add(delta => yogaAnimationManager.update(delta));
    }
}
/**
 * Can be used to optimize Yoga update calls.
 * If renderer is set yoga boundBoxCheck/layotutUpdate in updateTransform will be called ONLY when rendering.
 * @param renderer
 */
export function yogaSetRenderer(renderer) {
    renderer.on("prerender", () => YogaLayout.isRendering = true);
    renderer.on("postrender", () => YogaLayout.isRendering = false);
}
