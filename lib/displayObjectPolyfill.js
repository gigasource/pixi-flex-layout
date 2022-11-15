import * as PIXI from "pixi.js";
import { YogaLayout } from "./YogaLayout";
const NineSlicePlane = PIXI.NineSlicePlane || PIXI.mesh.NineSlicePlane;
// @ts-ignore
export function applyDisplayObjectPolyfill(prototype = PIXI.DisplayObject.prototype) {
    Object.defineProperty(prototype, "yoga", {
        get() {
            if (!this.__yoga) {
                this.__yoga = new YogaLayout(this);
                this.__hasYoga = true;
            }
            return this.__yoga;
        },
        set(v) {
            this.__yoga = v;
        }
    });
    Object.defineProperty(prototype, "visible", {
        get() {
            return this._visible;
        },
        set(v) {
            if (this.__hasYoga && this._visible !== v) {
                this.__yoga.display = v ? "flex" : "none";
            }
            this._visible = v;
        }
    });
    const destroy = prototype.destroy;
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
        for (let i = 0, j = this.__yoga.children.length; i < j; i++) {
            if (this.__yoga.children[i].target.visible) {
                this.__yoga.children[i].target.checkIfBoundingBoxChanged();
            }
        }
        const texture = this._texture;
        const bounds = this._bounds;
        if (texture) {
            let tw = Math.abs(this.__yoga.rescaleToYoga ? 1 : this.scale.x) * texture.orig.width;
            let th = Math.abs(this.__yoga.rescaleToYoga ? 1 : this.scale.y) * texture.orig.height;
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
                this.emit(YogaLayout.NEED_LAYOUT_UPDATE);
            }
            this._prevYogaLayoutHash = this._yogaLayoutHash;
        }
        else if (bounds) {
            this._yogaLayoutHash = -1000000;
            if (this.__yoga._width === "pixi") {
                let w = Math.round(bounds.maxX - bounds.minX);
                this.__yoga.node.setWidth(w);
                this._yogaLayoutHash += w * 0.2343;
            }
            if (this.__yoga._height === "pixi") {
                let h = Math.round(bounds.maxY - bounds.minY);
                this.__yoga.node.setHeight(h);
                this._yogaLayoutHash += h * 5121;
            }
            if (this._yogaLayoutHash !== -1000000 && this._yogaLayoutHash !== this._prevYogaLayoutHash) {
                this.emit(YogaLayout.NEED_LAYOUT_UPDATE);
            }
            this._prevYogaLayoutHash = this._yogaLayoutHash;
        }
    };
    prototype.updateYogaLayout = function () {
        this.__yoga.update();
        const updated = this.__yoga.willLayoutWillBeRecomputed();
        const layout = this.__yoga.getComputedLayout();
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
                this.emit(YogaLayout.AFTER_LAYOUT_UPDATED_EVENT, layout);
            }
        }
        for (let i = 0, j = this.__yoga.children.length; i < j; i++) {
            if (this.__yoga.children[i].target.visible) {
                this.__yoga.children[i].target.updateYogaLayout();
            }
        }
    };
}
