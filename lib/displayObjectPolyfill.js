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
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyDisplayObjectPolyfill = void 0;
var PIXI = __importStar(require("pixi.js"));
var pixi_js_1 = require("pixi.js");
var YogaLayout_1 = require("./YogaLayout");
var NineSlicePlane = PIXI.NineSlicePlane || PIXI.mesh.NineSlicePlane;
function applyDisplayObjectPolyfill(prototype) {
    if (prototype === void 0) { prototype = pixi_js_1.DisplayObject.prototype; }
    Object.defineProperty(prototype, "yoga", {
        get: function () {
            if (!this.__yoga) {
                this.__yoga = new YogaLayout_1.YogaLayout(this);
                this.__hasYoga = true;
            }
            return this.__yoga;
        },
        set: function (v) {
            this.__yoga = v;
        }
    });
    Object.defineProperty(prototype, "visible", {
        get: function () {
            return this._visible;
        },
        set: function (v) {
            if (this.__hasYoga && this._visible !== v) {
                this.__yoga.display = v ? "flex" : "none";
            }
            this._visible = v;
        }
    });
    var destroy = prototype.destroy;
    prototype.destroy = function () {
        if (this.__hasYoga) {
            this.yoga.children = [];
            this.yoga.node.free();
            this.yoga.parent = undefined;
            this.__hasYoga = false;
            delete this.yoga;
        }
        destroy.call(this);
    };
    prototype.checkIfBoundingBoxChanged = function () {
        if (this.updateText) {
            this.updateText(true);
        }
        for (var i = 0, j = this.__yoga.children.length; i < j; i++) {
            if (this.__yoga.children[i].target.visible) {
                this.__yoga.children[i].target.checkIfBoundingBoxChanged();
            }
        }
        var texture = this._texture;
        var bounds = this._bounds;
        if (texture) {
            var tw = Math.abs(this.__yoga.rescaleToYoga ? 1 : this.scale.x) * texture.orig.width;
            var th = Math.abs(this.__yoga.rescaleToYoga ? 1 : this.scale.y) * texture.orig.height;
            if (!this.__yoga.rescaleToYoga && this.updateHorizontalVertices /* Is NineSlicePlane?*/) {
                tw = this.width;
                th = this.height;
            }
            else if (this.__yoga.rescaleToYoga && this.__yoga.keepAspectRatio) {
                this.__yoga.aspectRatio = texture.orig.width / texture.orig.height;
            }
            this._yogaLayoutHash = tw * 0.12498 + th * 4121;
            if (this._yogaLayoutHash !== this._prevYogaLayoutHash) {
                this.__yoga._width === "pixi" && this.__yoga.node.setWidth(tw);
                this.__yoga._height === "pixi" && this.__yoga.node.setHeight(th);
                this.emit(YogaLayout_1.YogaLayout.NEED_LAYOUT_UPDATE);
            }
            this._prevYogaLayoutHash = this._yogaLayoutHash;
        }
        else if (bounds) {
            this._yogaLayoutHash = -1000000;
            if (this.__yoga._width === "pixi") {
                var w = Math.round(bounds.maxX - bounds.minX);
                this.__yoga.node.setWidth(w);
                this._yogaLayoutHash += w * 0.2343;
            }
            if (this.__yoga._height === "pixi") {
                var h = Math.round(bounds.maxY - bounds.minY);
                this.__yoga.node.setHeight(h);
                this._yogaLayoutHash += h * 5121;
            }
            if (this._yogaLayoutHash !== -1000000 && this._yogaLayoutHash !== this._prevYogaLayoutHash) {
                this.emit(YogaLayout_1.YogaLayout.NEED_LAYOUT_UPDATE);
            }
            this._prevYogaLayoutHash = this._yogaLayoutHash;
        }
    };
    prototype.updateYogaLayout = function () {
        this.__yoga.update();
        var updated = this.__yoga.willLayoutWillBeRecomputed();
        var layout = this.__yoga.getComputedLayout();
        if (updated || this.__yoga.animationConfig || this.__yoga.rescaleToYoga) {
            this.transform.position.set(layout.left, layout.top);
            if (this.__yoga.rescaleToYoga) {
                if (this.__yoga.keepAspectRatio && !isNaN(this.__yoga._height)) {
                    this.scale.set(layout.height / this.__yoga._height);
                }
                else {
                    this.width = layout.width;
                    this.height = layout.height;
                }
            }
            if (updated) {
                this.emit(YogaLayout_1.YogaLayout.AFTER_LAYOUT_UPDATED_EVENT, layout);
            }
        }
        for (var i = 0, j = this.__yoga.children.length; i < j; i++) {
            if (this.__yoga.children[i].target.visible) {
                this.__yoga.children[i].target.updateYogaLayout();
            }
        }
    };
}
exports.applyDisplayObjectPolyfill = applyDisplayObjectPolyfill;
