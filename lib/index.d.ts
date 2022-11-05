import * as PIXI from "pixi.js";
export { YogaLayout, IYogaAnimationConfig } from "./YogaLayout";
export { YogaLayoutConfig } from "./YogaLayoutConfig";
export * from "./YogaContants";
export interface IFlexLayoutOptions {
    usePixiSharedTicker: boolean;
}
/**
 * Polyfills PIXI.DisplayObject and PIXI.Container
 *
 */
export declare function initializeYogaLayout(options?: IFlexLayoutOptions): void;
/**
 * Can be used to optimize Yoga update calls.
 * If renderer is set yoga boundBoxCheck/layotutUpdate in updateTransform will be called ONLY when rendering.
 * @param renderer
 */
export declare function yogaSetRenderer(renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer): void;
