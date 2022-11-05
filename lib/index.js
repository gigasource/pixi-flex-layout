"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.yogaSetRenderer = exports.initializeYogaLayout = void 0;
var PIXI = __importStar(require("pixi.js"));
var containerPolyfill_1 = require("./containerPolyfill");
var displayObjectPolyfill_1 = require("./displayObjectPolyfill");
var YogaAnimationManager_1 = require("./YogaAnimationManager");
if (!window.PIXI) {
    window.PIXI = PIXI;
}
var YogaLayout_1 = require("./YogaLayout");
var YogaLayout_2 = require("./YogaLayout");
Object.defineProperty(exports, "YogaLayout", { enumerable: true, get: function () { return YogaLayout_2.YogaLayout; } });
__exportStar(require("./YogaContants"), exports);
/**
 * Polyfills PIXI.DisplayObject and PIXI.Container
 *
 */
function initializeYogaLayout(options) {
    if (options === void 0) { options = { usePixiSharedTicker: true }; }
    displayObjectPolyfill_1.applyDisplayObjectPolyfill();
    containerPolyfill_1.applyContainerPolyfill();
    if (options.usePixiSharedTicker) {
        PIXI.ticker.shared.add(function (delta) { return YogaAnimationManager_1.yogaAnimationManager.update(delta); });
    }
}
exports.initializeYogaLayout = initializeYogaLayout;
/**
 * Can be used to optimize Yoga update calls.
 * If renderer is set yoga boundBoxCheck/layotutUpdate in updateTransform will be called ONLY when rendering.
 * @param renderer
 */
function yogaSetRenderer(renderer) {
    renderer.on("prerender", function () { return YogaLayout_1.YogaLayout.isRendering = true; });
    renderer.on("postrender", function () { return YogaLayout_1.YogaLayout.isRendering = false; });
}
exports.yogaSetRenderer = yogaSetRenderer;
