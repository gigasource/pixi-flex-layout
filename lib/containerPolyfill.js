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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyContainerPolyfill = void 0;
var PIXI = __importStar(require("pixi.js"));
var YogaLayout_1 = require("./YogaLayout");
var Container = PIXI.Container;
function applyContainerPolyfill(proto) {
    if (proto === void 0) { proto = Container.prototype; }
    Object.defineProperty(proto, "flex", {
        get: function () {
            return this.__flex;
        },
        set: function (newFlex) {
            var _this = this;
            if (!this.flex && newFlex) {
                this.children.forEach(function (child) {
                    _this.yoga.addChild(child.yoga);
                    if (_this.flexRecursive && child instanceof PIXI.Container && child.flex !== false) {
                        child.flexRecursive = true;
                    }
                });
                this.emit(YogaLayout_1.YogaLayout.NEED_LAYOUT_UPDATE);
            }
            if (this.flex && !newFlex) {
                this.children.forEach(function (child) {
                    _this.yoga.removeChild(child.yoga);
                });
            }
            this.__flex = newFlex;
        }
    });
    Object.defineProperty(proto, "flexRecursive", {
        get: function () {
            return this.__flexRecursive;
        },
        set: function (newFlex) {
            this.__flexRecursive = newFlex;
            this.flex = newFlex;
        }
    });
    var addChild = proto.addChild;
    var removeChildren = proto.removeChildren;
    var addChildAt = proto.addChildAt;
    var removeChild = proto.removeChild;
    var containerUpdateTransform = proto.updateTransform;
    proto.addChild = function () {
        var children = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            children[_i] = arguments[_i];
        }
        if (children.length === 1) {
            var child = children[0];
            if (this.flex) {
                child.yoga = child.yoga || new YogaLayout_1.YogaLayout(child);
                child.__hasYoga = true;
                this.yoga.addChild(child.yoga);
            }
            if (this.flexRecursive && child instanceof PIXI.Container && child.flex !== false) {
                child.flexRecursive = true;
            }
            this.emit(YogaLayout_1.YogaLayout.NEED_LAYOUT_UPDATE);
        }
        return addChild.call.apply(addChild, __spreadArrays([this], children));
    };
    proto.addChildAt = function (child, index) {
        if (this.flex) {
            child.yoga = child.yoga || new YogaLayout_1.YogaLayout(child);
            this.__hasYoga = true;
            this.yoga.addChild(child.yoga, index);
        }
        if (this.flexRecursive && child instanceof PIXI.Container && child.flex !== false) {
            child.flexRecursive = true;
        }
        this.emit(YogaLayout_1.YogaLayout.NEED_LAYOUT_UPDATE);
        return addChildAt.call(this, child, index);
    };
    proto.removeChild = function () {
        var children = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            children[_i] = arguments[_i];
        }
        if (children.length === 1) {
            var child = children[0];
            if (this.flex) {
                this.yoga.removeChild(child.yoga);
            }
            this.emit(YogaLayout_1.YogaLayout.NEED_LAYOUT_UPDATE);
        }
        return removeChild.call.apply(removeChild, __spreadArrays([this], children));
    };
    proto.removeChildren = function (beginIndex, endIndex) {
        var _this = this;
        if (this.__hasYoga) {
            var begin = beginIndex || 0;
            var end = typeof endIndex === 'number' ? endIndex : this.children.length;
            var range = end - begin;
            if (range > 0 && range <= end) {
                var removed = this.children.slice(begin, range);
                removed.forEach(function (child) { return child.__hasYoga && _this.yoga.removeChild(child.yoga); });
            }
            this.emit(YogaLayout_1.YogaLayout.NEED_LAYOUT_UPDATE);
        }
        return removeChildren.call(this, beginIndex, endIndex);
    };
    proto.updateTransform = function () {
        if (this.__hasYoga && this.__yoga.isRoot && YogaLayout_1.YogaLayout.isRendering) {
            this.checkIfBoundingBoxChanged();
            this.updateYogaLayout();
        }
        return containerUpdateTransform.call(this);
    };
}
exports.applyContainerPolyfill = applyContainerPolyfill;
