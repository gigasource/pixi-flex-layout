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
exports.YogaLayout = void 0;
var Yoga = __importStar(require("yoga-layout-prebuilt-low-memory"));
var PIXI = __importStar(require("pixi.js"));
var YogaContants_1 = require("./YogaContants");
var YogaAnimationManager_1 = require("./YogaAnimationManager");
var YogaEdges = YogaContants_1.YogaConstants.YogaEdges;
var DisplayObject = PIXI.DisplayObject;
var Display = YogaContants_1.YogaConstants.Display;
var YogaLayout = /** @class */ (function () {
    function YogaLayout(pixiObject) {
        var _this = this;
        if (pixiObject === void 0) { pixiObject = new DisplayObject(); }
        this.children = [];
        /**
         * True if Yoga should manage PIXI objects width/height
         */
        this.rescaleToYoga = false;
        this.aspectRatioMainDiemension = "height";
        this._lastRecalculationDuration = 0;
        /**
         * Will be recalculated in next frame
         */
        this._needUpdateAsRoot = false;
        this._gap = 0;
        /**
         * Internal values stored to reduce calls to nbind
         */
        this._marginTop = 0;
        this._marginLeft = 0;
        this.node = Yoga.Node.create();
        pixiObject.__hasYoga = true;
        this.fillDefaults();
        this.target = pixiObject;
        if (this.target._texture) {
            this.width = this.height = "pixi";
        }
        else {
            this.width = this.height = "auto";
        }
        if (pixiObject instanceof PIXI.Text || pixiObject instanceof PIXI.Sprite) {
            this.keepAspectRatio = true;
        }
        if (pixiObject instanceof PIXI.Text) {
            this.aspectRatioMainDiemension = "width";
        }
        // broadcast event
        pixiObject.on(YogaLayout.LAYOUT_UPDATED_EVENT, function () {
            _this._lastLayout = _this._cachedLayout;
            _this._cachedLayout = undefined;
            _this.children.forEach(function (child) { return child.target.emit(YogaLayout.LAYOUT_UPDATED_EVENT); });
        });
        pixiObject.on(YogaLayout.NEED_LAYOUT_UPDATE, function () {
            // size change of this element wont change size/positions of its parent, so there is no need to update whole tree
            if (!_this.parent /*|| (this.hasContantDeclaredSize && this.parent.width !== "auto" && this.parent.height !== "auto")*/) {
                _this._needUpdateAsRoot = true;
            }
            else {
                _this.parent.target.emit(YogaLayout.NEED_LAYOUT_UPDATE);
            }
        });
    }
    Object.defineProperty(YogaLayout.prototype, "animationState", {
        get: function () {
            return this._animation;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "root", {
        set: function (val) {
            var root = YogaLayout.roots.get(val);
            if (root) {
                root.addChild(this);
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Assigns given properties to this yoga layout
     * @param config
     */
    YogaLayout.prototype.fromConfig = function (config) {
        Object.assign(this, config);
    };
    Object.defineProperty(YogaLayout.prototype, "config", {
        /**
         * Same as 'fromConfig()'
         * @param config
         */
        set: function (config) {
            this.fromConfig(config);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Copies all properties (styles, size, rescaleToYoga etc) from other YogaLayout objects
     * @param layout
     */
    YogaLayout.prototype.copy = function (layout) {
        this.node.copyStyle(layout.node);
        this.rescaleToYoga = layout.rescaleToYoga;
        this.aspectRatio = layout.aspectRatio;
        this.keepAspectRatio = layout.keepAspectRatio;
        this._width = layout._width;
        this._height = layout._height;
    };
    YogaLayout.prototype.fillDefaults = function () {
        this.node.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
        this.node.setAlignItems(Yoga.ALIGN_FLEX_START);
        this.node.setAlignContent(Yoga.ALIGN_FLEX_START);
        this.node.setWidth("auto");
        this.node.setHeight("auto");
    };
    YogaLayout.prototype.addChild = function (yoga, index) {
        if (index === void 0) { index = this.node.getChildCount(); }
        if (yoga.parent) {
            yoga.parent.removeChild(yoga);
        }
        this.node.insertChild(yoga.node, index);
        this.children.splice(index, 0, yoga);
        yoga.parent = this;
        this.updateGap();
    };
    YogaLayout.prototype.removeChild = function (yoga) {
        var length = this.children.length;
        this.children = this.children.filter(function (child) { return child !== yoga; });
        if (length !== this.children.length) {
            this.node.removeChild(yoga.node);
        }
        yoga.parent = undefined;
    };
    /**
     * Mark object as dirty and request layout recalculation
     */
    YogaLayout.prototype.requestLayoutUpdate = function () {
        this.target.emit(YogaLayout.NEED_LAYOUT_UPDATE);
    };
    YogaLayout.prototype.recalculateLayout = function () {
        var start = performance.now();
        this.node.calculateLayout();
        this._lastRecalculationDuration = performance.now() - start;
        // console.log("recalculated: ", this._lastRecalculationDuration, this)
        this.target.emit(YogaLayout.LAYOUT_UPDATED_EVENT);
    };
    YogaLayout.prototype.update = function () {
        if (!this.target.parent && this.parent) {
            this.parent.removeChild(this);
            return;
        }
        if (this._needUpdateAsRoot && !this.parent) {
            this.recalculateLayout();
        }
        this._needUpdateAsRoot = false;
    };
    Object.defineProperty(YogaLayout.prototype, "isRoot", {
        get: function () {
            return !this.parent;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "hasContantDeclaredSize", {
        /**
         * Returns true if object size is independent of its children sizes.
         */
        get: function () {
            return !!this._width && this._width !== "pixi" && this._width !== "auto"
                && !!this._height && this._height !== "pixi" && this._height !== "auto";
        },
        enumerable: false,
        configurable: true
    });
    YogaLayout.prototype.willLayoutWillBeRecomputed = function () {
        return !this._cachedLayout;
    };
    YogaLayout.prototype.getComputedLayout = function () {
        var _a, _b, _c, _d;
        if (!this._cachedLayout) {
            this._cachedLayout = this.node.getComputedLayout();
            // YOGA FIX for percent widht/height for absolute positioned elements
            if (this.position === "absolute" && this.parent && this.node.getWidth().unit === Yoga.UNIT_PERCENT) {
                this._cachedLayout.width = Math.round(parseFloat(this._width) / 100 * this.parent.calculatedWidth);
            }
            if (this.position === "absolute" && this.parent && this.node.getHeight().unit === Yoga.UNIT_PERCENT) {
                this._cachedLayout.height = Math.round(parseFloat(this._height) / 100 * this.parent.calculatedHeight);
            }
            // if (this.position === "absolute" && this.parent && !this.bottom && !this.right) {
            //     this._cachedLayout.left = this.node.getComputedMargin(Yoga.EDGE_LEFT);
            //     this._cachedLayout.top = this.node.getComputedMargin(Yoga.EDGE_TOP)
            // }
            // YOGA FIX for not working aspect ratio https://github.com/facebook/yoga/issues/677
            if (this._aspectRatio && this.keepAspectRatio) {
                if (this.aspectRatioMainDiemension === "height") {
                    var newWidth = this.calculatedHeight / this._aspectRatio;
                    //   this._cachedLayout.top += (this.calculatedHeight - newHeight) / 2;
                    this._cachedLayout.width = newWidth;
                    this.width = this.calculatedWidth;
                }
                else {
                    var newHeight = this.calculatedWidth / this._aspectRatio;
                    this._cachedLayout.height = newHeight;
                    this.height = this.calculatedHeight;
                }
            }
            if (this.animationConfig && (!this.animationConfig.shouldRunAnimation || this.animationConfig.shouldRunAnimation(this, this._lastLayout || this._cachedLayout, this._cachedLayout))) {
                this._animation = {
                    fromX: ((_a = this._lastLayout) === null || _a === void 0 ? void 0 : _a.left) || this._cachedLayout.left,
                    fromY: ((_b = this._lastLayout) === null || _b === void 0 ? void 0 : _b.top) || this._cachedLayout.top,
                    curX: ((_c = this._lastLayout) === null || _c === void 0 ? void 0 : _c.left) || this._cachedLayout.left,
                    curY: ((_d = this._lastLayout) === null || _d === void 0 ? void 0 : _d.top) || this._cachedLayout.top,
                    toX: this._cachedLayout.left,
                    toY: this._cachedLayout.top,
                    time: this.animationConfig.time,
                    elapsed: 0,
                    easing: this.animationConfig.easing
                };
                YogaAnimationManager_1.yogaAnimationManager.add(this._animation);
            }
            else {
                this._animation = {
                    curX: this._cachedLayout.left,
                    curY: this._cachedLayout.top
                };
            }
        }
        this._cachedLayout.left = this._animation.curX;
        this._cachedLayout.top = this._animation.curY;
        return this._cachedLayout;
    };
    Object.defineProperty(YogaLayout.prototype, "aspectRatio", {
        get: function () {
            return this._aspectRatio;
        },
        set: function (value) {
            if (this._aspectRatio === value) {
                return;
            }
            this._aspectRatio = value;
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "isWidthCalculatedFromPixi", {
        get: function () {
            return this._width === "pixi";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "isHeightCalculatedFromPixi", {
        get: function () {
            return this._height === "pixi";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "calculatedWidth", {
        /**
         * Returns computed width in pixels
         */
        get: function () {
            return this._cachedLayout ? this._cachedLayout.width : this.node.getComputedWidth();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "calculatedHeight", {
        /**
         * Returns computed height in pixels
         */
        get: function () {
            return this._cachedLayout ? this._cachedLayout.height : this.node.getComputedHeight();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "width", {
        get: function () {
            return this._parseValue(this.node.getWidth());
        },
        /**
         * Can handle:
         * - pixels (eg 150)
         * - percents ("50%")
         * - "auto" to use values from yoga
         * - "pixi" to use DisplayObject.width/height
         * @param value
         */
        set: function (value) {
            if (this._width === value) {
                return;
            }
            this._width = value;
            if (value !== "pixi") {
                this.node.setWidth(value);
            }
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "height", {
        get: function () {
            return this._parseValue(this.node.getHeight());
        },
        /**
         * Can handle:
         * - pixels (eg 150)
         * - percents ("50%")
         * - "auto" to use values from yoga
         * - "pixi" to use DisplayObject.width/height
         * @param value
         */
        set: function (value) {
            if (this._height === value) {
                return;
            }
            this._height = value;
            if (value !== "pixi") {
                this.node.setHeight(value);
            }
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "flexDirection", {
        get: function () {
            return YogaContants_1.YogaConstants.FlexDirection[this.node.getFlexDirection()];
        },
        set: function (direction) {
            this.node.setFlexDirection(YogaContants_1.YogaConstants.FlexDirection[direction]);
            this.updateGap();
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "justifyContent", {
        get: function () {
            return YogaContants_1.YogaConstants.JustifyContent[this.node.getJustifyContent()];
        },
        set: function (just) {
            this.node.setJustifyContent(YogaContants_1.YogaConstants.JustifyContent[just]);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "alignContent", {
        get: function () {
            return YogaContants_1.YogaConstants.Align[this.node.getAlignContent()];
        },
        set: function (align) {
            this.node.setAlignContent(YogaContants_1.YogaConstants.Align[align]);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "alignItems", {
        get: function () {
            // @ts-ignore
            return YogaContants_1.YogaConstants.Align[this.node.getAlignItems()];
        },
        set: function (align) {
            this.node.setAlignItems(YogaContants_1.YogaConstants.Align[align]);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "alignSelf", {
        get: function () {
            // @ts-ignore
            return YogaContants_1.YogaConstants.Align[this.node.getAlignSelf()];
        },
        set: function (align) {
            this.node.setAlignSelf(YogaContants_1.YogaConstants.Align[align]);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "flexWrap", {
        get: function () {
            // @ts-ignore
            return YogaContants_1.YogaConstants.FlexWrap[this.node.getFlexWrap()];
        },
        set: function (wrap) {
            this.node.setFlexWrap(YogaContants_1.YogaConstants.FlexWrap[wrap]);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "flexGrow", {
        get: function () {
            return this.node.getFlexGrow();
        },
        set: function (grow) {
            this.node.setFlexGrow(grow);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "flexShrink", {
        get: function () {
            return this.node.getFlexShrink();
        },
        set: function (shrink) {
            this.node.setFlexShrink(shrink);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "flexBasis", {
        get: function () {
            return this.node.getFlexBasis();
        },
        set: function (basis) {
            this.node.setFlexBasis(basis);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "position", {
        get: function () {
            // @ts-ignore
            return YogaContants_1.YogaConstants.PositionType[this.node.getPositionType()];
        },
        set: function (type) {
            this.node.setPositionType(YogaContants_1.YogaConstants.PositionType[type]);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "padding", {
        get: function () {
            var _this = this;
            return YogaEdges.map(function (edge) { return _this.node.getPadding(edge).value || 0; });
        },
        set: function (margin) {
            var _this = this;
            YogaEdges.forEach(function (edge, index) {
                var value = margin[index];
                _this.node.setPadding(edge, value);
            });
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "paddingAll", {
        set: function (value) {
            this.padding = [value, value, value, value];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "paddingTop", {
        get: function () {
            return this.node.getPadding(Yoga.EDGE_TOP).value || 0;
        },
        set: function (value) {
            this.node.setPadding(Yoga.EDGE_TOP, value);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "paddingBottom", {
        get: function () {
            return this.node.getPadding(Yoga.EDGE_BOTTOM).value || 0;
        },
        set: function (value) {
            this.node.setPadding(Yoga.EDGE_BOTTOM, value);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "paddingLeft", {
        get: function () {
            return this.node.getPadding(Yoga.EDGE_LEFT).value || 0;
        },
        set: function (value) {
            this.node.setPadding(Yoga.EDGE_LEFT, value);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "paddingRight", {
        get: function () {
            return this.node.getPadding(Yoga.EDGE_RIGHT).value || 0;
        },
        set: function (value) {
            this.node.setPadding(Yoga.EDGE_RIGHT, value);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "margin", {
        get: function () {
            var _this = this;
            return YogaEdges.map(function (edge) { return _this.node.getMargin(edge).value || 0; });
        },
        set: function (margin) {
            var _this = this;
            YogaEdges.forEach(function (edge, index) {
                var value = margin[index];
                _this.node.setMargin(edge, value);
            });
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "marginAll", {
        set: function (value) {
            this.margin = [value, value, value, value];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "marginTop", {
        get: function () {
            return this._marginTop;
        },
        set: function (value) {
            if (this._marginTop !== value) {
                this._marginTop = value;
                this.node.setMargin(Yoga.EDGE_TOP, value);
                this.requestLayoutUpdate();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "marginBottom", {
        get: function () {
            return this.node.getMargin(Yoga.EDGE_BOTTOM).value || 0;
        },
        set: function (value) {
            this.node.setMargin(Yoga.EDGE_BOTTOM, value);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "marginLeft", {
        get: function () {
            return this._marginLeft;
        },
        set: function (value) {
            if (this._marginLeft !== value) {
                this._marginLeft = value;
                this.node.setMargin(Yoga.EDGE_LEFT, value);
                this.requestLayoutUpdate();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "marginRight", {
        get: function () {
            return this.node.getMargin(Yoga.EDGE_RIGHT).value || 0;
        },
        set: function (value) {
            this.node.setMargin(Yoga.EDGE_RIGHT, value);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "border", {
        get: function () {
            var _this = this;
            return YogaEdges.map(function (edge) { return _this.node.getBorder(edge); });
        },
        set: function (margin) {
            var _this = this;
            YogaEdges.forEach(function (edge, index) {
                var value = margin[index];
                _this.node.setBorder(edge, value);
            });
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "borderAll", {
        set: function (value) {
            this.border = [value, value, value, value];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "borderTop", {
        get: function () {
            return this.node.getBorder(Yoga.EDGE_TOP);
        },
        set: function (value) {
            this.node.setBorder(Yoga.EDGE_TOP, value);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "borderBottom", {
        get: function () {
            return this.node.getBorder(Yoga.EDGE_BOTTOM);
        },
        set: function (value) {
            this.node.setBorder(Yoga.EDGE_BOTTOM, value);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "borderLeft", {
        set: function (value) {
            this.node.setBorder(Yoga.EDGE_LEFT, value);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "bordereft", {
        get: function () {
            return this.node.getBorder(Yoga.EDGE_LEFT);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "borderRight", {
        get: function () {
            return this.node.getBorder(Yoga.EDGE_RIGHT);
        },
        set: function (value) {
            this.node.setBorder(Yoga.EDGE_RIGHT, value);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "top", {
        get: function () {
            return this._parseValue(this.node.getPosition(Yoga.EDGE_TOP));
        },
        set: function (value) {
            this.node.setPosition(Yoga.EDGE_TOP, value);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "bottom", {
        get: function () {
            return this._parseValue(this.node.getPosition(Yoga.EDGE_BOTTOM));
        },
        set: function (value) {
            this.node.setPosition(Yoga.EDGE_BOTTOM, value);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "left", {
        get: function () {
            return this._parseValue(this.node.getPosition(Yoga.EDGE_LEFT));
        },
        set: function (value) {
            this.node.setPosition(Yoga.EDGE_LEFT, value);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "right", {
        get: function () {
            return this._parseValue(this.node.getPosition(Yoga.EDGE_RIGHT));
        },
        set: function (value) {
            this.node.setPosition(Yoga.EDGE_RIGHT, value);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "minWidth", {
        get: function () {
            return this._parseValue(this.node.getMinWidth());
        },
        set: function (value) {
            this.node.setMinWidth(value);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "minHeight", {
        get: function () {
            return this._parseValue(this.node.getMinHeight());
        },
        set: function (value) {
            this.node.setMinHeight(value);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "maxWidth", {
        get: function () {
            return this._parseValue(this.node.getMaxWidth());
        },
        set: function (value) {
            this.node.setMaxWidth(value);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "maxHeight", {
        get: function () {
            return this._parseValue(this.node.getMaxHeight());
        },
        set: function (value) {
            this.node.setMaxHeight(value);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "display", {
        get: function () {
            // @ts-ignore
            return Display[this.node.getDisplay()];
        },
        set: function (value) {
            this.node.setDisplay(YogaContants_1.YogaConstants.Display[value]);
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(YogaLayout.prototype, "gap", {
        get: function () {
            return this._gap;
        },
        set: function (val) {
            if (this._gap === val) {
                return;
            }
            this._gap = val;
            this.updateGap();
            this.requestLayoutUpdate();
        },
        enumerable: false,
        configurable: true
    });
    YogaLayout.prototype.updateGap = function () {
        var _this = this;
        if (!this._gap) {
            return;
        }
        var firstChildrenSkipped = false;
        this.children.forEach(function (child, index) {
            if (firstChildrenSkipped) {
                _this.flexDirection === "column" ? child.marginTop = _this._gap : child.marginLeft = _this._gap;
            }
            if (child.position !== "absolute") {
                firstChildrenSkipped = true;
            }
        });
    };
    YogaLayout.prototype._parseValue = function (value) {
        if (value.unit === Yoga.UNIT_POINT) {
            return parseFloat(value.value);
        }
        if (value.unit === Yoga.UNIT_PERCENT) {
            return value.value.toString() + "%";
        }
        if (value.unit === Yoga.UNIT_AUTO) {
            return "auto";
        }
        return undefined;
    };
    /**
     * Internal value. True if we are currently in WebGLRenderer.render() (based on 'prerender' and 'postrender' events). Used to skip some updateTransform calls.
     */
    YogaLayout.isRendering = true;
    /**
     * Experimental feature for building layouts independent of pixi tree
     */
    YogaLayout.roots = new Map();
    YogaLayout.LAYOUT_UPDATED_EVENT = "LAYOUT_UPDATED_EVENT";
    YogaLayout.AFTER_LAYOUT_UPDATED_EVENT = "AFTER_LAYOUT_UPDATED_EVENT";
    YogaLayout.NEED_LAYOUT_UPDATE = "NEED_LAYOUT_UPDATE";
    return YogaLayout;
}());
exports.YogaLayout = YogaLayout;
