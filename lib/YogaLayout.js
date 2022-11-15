import * as Yoga from "yoga-layout-prebuilt-low-memory";
import * as PIXI from "pixi.js";
import { YogaConstants } from "./YogaContants";
import { yogaAnimationManager } from "./YogaAnimationManager";
var YogaEdges = YogaConstants.YogaEdges;
var Display = YogaConstants.Display;
import { DisplayObject } from "pixi.js";
export class YogaLayout {
    // @ts-ignore
    constructor(pixiObject = new DisplayObject()) {
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
        pixiObject.on(YogaLayout.LAYOUT_UPDATED_EVENT, () => {
            this._lastLayout = this._cachedLayout;
            this._cachedLayout = undefined;
            this.children.forEach(child => child.target.emit(YogaLayout.LAYOUT_UPDATED_EVENT));
        });
        pixiObject.on(YogaLayout.NEED_LAYOUT_UPDATE, () => {
            // size change of this element wont change size/positions of its parent, so there is no need to update whole tree
            if (!this.parent /*|| (this.hasContantDeclaredSize && this.parent.width !== "auto" && this.parent.height !== "auto")*/) {
                this._needUpdateAsRoot = true;
            }
            else {
                this.parent.target.emit(YogaLayout.NEED_LAYOUT_UPDATE);
            }
        });
    }
    get animationState() {
        return this._animation;
    }
    set root(val) {
        const root = YogaLayout.roots.get(val);
        if (root) {
            root.addChild(this);
        }
    }
    /**
     * Assigns given properties to this yoga layout
     * @param config
     */
    fromConfig(config) {
        Object.assign(this, config);
    }
    /**
     * Same as 'fromConfig()'
     * @param config
     */
    set config(config) {
        this.fromConfig(config);
    }
    /**
     * Copies all properties (styles, size, rescaleToYoga etc) from other YogaLayout objects
     * @param layout
     */
    copy(layout) {
        this.node.copyStyle(layout.node);
        this.rescaleToYoga = layout.rescaleToYoga;
        this.aspectRatio = layout.aspectRatio;
        this.keepAspectRatio = layout.keepAspectRatio;
        this._width = layout._width;
        this._height = layout._height;
    }
    fillDefaults() {
        this.node.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
        this.node.setAlignItems(Yoga.ALIGN_FLEX_START);
        this.node.setAlignContent(Yoga.ALIGN_FLEX_START);
        this.node.setWidth("auto");
        this.node.setHeight("auto");
    }
    addChild(yoga, index = this.node.getChildCount()) {
        if (yoga.parent) {
            yoga.parent.removeChild(yoga);
        }
        this.node.insertChild(yoga.node, index);
        this.children.splice(index, 0, yoga);
        yoga.parent = this;
        this.updateGap();
    }
    removeChild(yoga) {
        const length = this.children.length;
        this.children = this.children.filter(child => child !== yoga);
        if (length !== this.children.length) {
            this.node.removeChild(yoga.node);
        }
        yoga.parent = undefined;
    }
    /**
     * Mark object as dirty and request layout recalculation
     */
    requestLayoutUpdate() {
        this.target.emit(YogaLayout.NEED_LAYOUT_UPDATE);
    }
    recalculateLayout() {
        const start = performance.now();
        this.node.calculateLayout();
        this._lastRecalculationDuration = performance.now() - start;
        // console.log("recalculated: ", this._lastRecalculationDuration, this)
        this.target.emit(YogaLayout.LAYOUT_UPDATED_EVENT);
    }
    update() {
        if (!this.target.parent && this.parent) {
            this.parent.removeChild(this);
            return;
        }
        if (this._needUpdateAsRoot && !this.parent) {
            this.recalculateLayout();
        }
        this._needUpdateAsRoot = false;
    }
    get isRoot() {
        return !this.parent;
    }
    /**
     * Returns true if object size is independent of its children sizes.
     */
    get hasContantDeclaredSize() {
        return !!this._width && this._width !== "pixi" && this._width !== "auto"
            && !!this._height && this._height !== "pixi" && this._height !== "auto";
    }
    willLayoutWillBeRecomputed() {
        return !this._cachedLayout;
    }
    getComputedLayout() {
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
                    const newWidth = this.calculatedHeight / this._aspectRatio;
                    //   this._cachedLayout.top += (this.calculatedHeight - newHeight) / 2;
                    this._cachedLayout.width = newWidth;
                    this.width = this.calculatedWidth;
                }
                else {
                    const newHeight = this.calculatedWidth / this._aspectRatio;
                    this._cachedLayout.height = newHeight;
                    this.height = this.calculatedHeight;
                }
            }
            if (this.animationConfig && (!this.animationConfig.shouldRunAnimation || this.animationConfig.shouldRunAnimation(this, this._lastLayout || this._cachedLayout, this._cachedLayout))) {
                this._animation = {
                    fromX: this._lastLayout?.left || this._cachedLayout.left,
                    fromY: this._lastLayout?.top || this._cachedLayout.top,
                    curX: this._lastLayout?.left || this._cachedLayout.left,
                    curY: this._lastLayout?.top || this._cachedLayout.top,
                    toX: this._cachedLayout.left,
                    toY: this._cachedLayout.top,
                    time: this.animationConfig.time,
                    elapsed: 0,
                    easing: this.animationConfig.easing
                };
                yogaAnimationManager.add(this._animation);
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
    }
    set aspectRatio(value) {
        if (this._aspectRatio === value) {
            return;
        }
        this._aspectRatio = value;
        this.requestLayoutUpdate();
    }
    get aspectRatio() {
        return this._aspectRatio;
    }
    get isWidthCalculatedFromPixi() {
        return this._width === "pixi";
    }
    get isHeightCalculatedFromPixi() {
        return this._height === "pixi";
    }
    /**
     * Returns computed width in pixels
     */
    get calculatedWidth() {
        return this._cachedLayout ? this._cachedLayout.width : this.node.getComputedWidth();
    }
    /**
     * Returns computed height in pixels
     */
    get calculatedHeight() {
        return this._cachedLayout ? this._cachedLayout.height : this.node.getComputedHeight();
    }
    /**
     * Can handle:
     * - pixels (eg 150)
     * - percents ("50%")
     * - "auto" to use values from yoga
     * - "pixi" to use DisplayObject.width/height
     * @param value
     */
    set width(value) {
        if (this._width === value) {
            return;
        }
        this._width = value;
        if (value !== "pixi") {
            this.node.setWidth(value);
        }
        this.requestLayoutUpdate();
    }
    get width() {
        return this._parseValue(this.node.getWidth());
    }
    /**
     * Can handle:
     * - pixels (eg 150)
     * - percents ("50%")
     * - "auto" to use values from yoga
     * - "pixi" to use DisplayObject.width/height
     * @param value
     */
    set height(value) {
        if (this._height === value) {
            return;
        }
        this._height = value;
        if (value !== "pixi") {
            this.node.setHeight(value);
        }
        this.requestLayoutUpdate();
    }
    get height() {
        return this._parseValue(this.node.getHeight());
    }
    set flexDirection(direction) {
        this.node.setFlexDirection(YogaConstants.FlexDirection[direction]);
        this.updateGap();
        this.requestLayoutUpdate();
    }
    get flexDirection() {
        return YogaConstants.FlexDirection[this.node.getFlexDirection()];
    }
    set justifyContent(just) {
        this.node.setJustifyContent(YogaConstants.JustifyContent[just]);
        this.requestLayoutUpdate();
    }
    get justifyContent() {
        return YogaConstants.JustifyContent[this.node.getJustifyContent()];
    }
    set alignContent(align) {
        this.node.setAlignContent(YogaConstants.Align[align]);
        this.requestLayoutUpdate();
    }
    get alignContent() {
        return YogaConstants.Align[this.node.getAlignContent()];
    }
    set alignItems(align) {
        this.node.setAlignItems(YogaConstants.Align[align]);
        this.requestLayoutUpdate();
    }
    get alignItems() {
        // @ts-ignore
        return YogaConstants.Align[this.node.getAlignItems()];
    }
    set alignSelf(align) {
        this.node.setAlignSelf(YogaConstants.Align[align]);
        this.requestLayoutUpdate();
    }
    get alignSelf() {
        // @ts-ignore
        return YogaConstants.Align[this.node.getAlignSelf()];
    }
    set flexWrap(wrap) {
        this.node.setFlexWrap(YogaConstants.FlexWrap[wrap]);
        this.requestLayoutUpdate();
    }
    get flexWrap() {
        // @ts-ignore
        return YogaConstants.FlexWrap[this.node.getFlexWrap()];
    }
    set flexGrow(grow) {
        this.node.setFlexGrow(grow);
        this.requestLayoutUpdate();
    }
    get flexGrow() {
        return this.node.getFlexGrow();
    }
    set flexShrink(shrink) {
        this.node.setFlexShrink(shrink);
        this.requestLayoutUpdate();
    }
    get flexShrink() {
        return this.node.getFlexShrink();
    }
    set flexBasis(basis) {
        this.node.setFlexBasis(basis);
        this.requestLayoutUpdate();
    }
    get flexBasis() {
        return this.node.getFlexBasis();
    }
    set position(type) {
        this.node.setPositionType(YogaConstants.PositionType[type]);
        this.requestLayoutUpdate();
    }
    get position() {
        // @ts-ignore
        return YogaConstants.PositionType[this.node.getPositionType()];
    }
    set padding(margin) {
        YogaEdges.forEach((edge, index) => {
            const value = margin[index];
            this.node.setPadding(edge, value);
        });
        this.requestLayoutUpdate();
    }
    get padding() {
        return YogaEdges.map(edge => this.node.getPadding(edge).value || 0);
    }
    set paddingAll(value) {
        this.padding = [value, value, value, value];
    }
    set paddingTop(value) {
        this.node.setPadding(Yoga.EDGE_TOP, value);
        this.requestLayoutUpdate();
    }
    get paddingTop() {
        return this.node.getPadding(Yoga.EDGE_TOP).value || 0;
    }
    set paddingBottom(value) {
        this.node.setPadding(Yoga.EDGE_BOTTOM, value);
        this.requestLayoutUpdate();
    }
    get paddingBottom() {
        return this.node.getPadding(Yoga.EDGE_BOTTOM).value || 0;
    }
    set paddingLeft(value) {
        this.node.setPadding(Yoga.EDGE_LEFT, value);
        this.requestLayoutUpdate();
    }
    get paddingLeft() {
        return this.node.getPadding(Yoga.EDGE_LEFT).value || 0;
    }
    set paddingRight(value) {
        this.node.setPadding(Yoga.EDGE_RIGHT, value);
        this.requestLayoutUpdate();
    }
    get paddingRight() {
        return this.node.getPadding(Yoga.EDGE_RIGHT).value || 0;
    }
    set margin(margin) {
        YogaEdges.forEach((edge, index) => {
            const value = margin[index];
            this.node.setMargin(edge, value);
        });
        this.requestLayoutUpdate();
    }
    set marginAll(value) {
        this.margin = [value, value, value, value];
    }
    get margin() {
        return YogaEdges.map(edge => this.node.getMargin(edge).value || 0);
    }
    set marginTop(value) {
        if (this._marginTop !== value) {
            this._marginTop = value;
            this.node.setMargin(Yoga.EDGE_TOP, value);
            this.requestLayoutUpdate();
        }
    }
    get marginTop() {
        return this._marginTop;
    }
    set marginBottom(value) {
        this.node.setMargin(Yoga.EDGE_BOTTOM, value);
        this.requestLayoutUpdate();
    }
    get marginBottom() {
        return this.node.getMargin(Yoga.EDGE_BOTTOM).value || 0;
    }
    set marginLeft(value) {
        if (this._marginLeft !== value) {
            this._marginLeft = value;
            this.node.setMargin(Yoga.EDGE_LEFT, value);
            this.requestLayoutUpdate();
        }
    }
    get marginLeft() {
        return this._marginLeft;
    }
    set marginRight(value) {
        this.node.setMargin(Yoga.EDGE_RIGHT, value);
        this.requestLayoutUpdate();
    }
    get marginRight() {
        return this.node.getMargin(Yoga.EDGE_RIGHT).value || 0;
    }
    set border(margin) {
        YogaEdges.forEach((edge, index) => {
            const value = margin[index];
            this.node.setBorder(edge, value);
        });
        this.requestLayoutUpdate();
    }
    get border() {
        return YogaEdges.map(edge => this.node.getBorder(edge));
    }
    set borderAll(value) {
        this.border = [value, value, value, value];
    }
    set borderTop(value) {
        this.node.setBorder(Yoga.EDGE_TOP, value);
        this.requestLayoutUpdate();
    }
    get borderTop() {
        return this.node.getBorder(Yoga.EDGE_TOP);
    }
    set borderBottom(value) {
        this.node.setBorder(Yoga.EDGE_BOTTOM, value);
        this.requestLayoutUpdate();
    }
    get borderBottom() {
        return this.node.getBorder(Yoga.EDGE_BOTTOM);
    }
    set borderLeft(value) {
        this.node.setBorder(Yoga.EDGE_LEFT, value);
        this.requestLayoutUpdate();
    }
    get bordereft() {
        return this.node.getBorder(Yoga.EDGE_LEFT);
    }
    set borderRight(value) {
        this.node.setBorder(Yoga.EDGE_RIGHT, value);
        this.requestLayoutUpdate();
    }
    get borderRight() {
        return this.node.getBorder(Yoga.EDGE_RIGHT);
    }
    set top(value) {
        this.node.setPosition(Yoga.EDGE_TOP, value);
        this.requestLayoutUpdate();
    }
    get top() {
        return this._parseValue(this.node.getPosition(Yoga.EDGE_TOP));
    }
    set bottom(value) {
        this.node.setPosition(Yoga.EDGE_BOTTOM, value);
        this.requestLayoutUpdate();
    }
    get bottom() {
        return this._parseValue(this.node.getPosition(Yoga.EDGE_BOTTOM));
    }
    set left(value) {
        this.node.setPosition(Yoga.EDGE_LEFT, value);
        this.requestLayoutUpdate();
    }
    get left() {
        return this._parseValue(this.node.getPosition(Yoga.EDGE_LEFT));
    }
    set right(value) {
        this.node.setPosition(Yoga.EDGE_RIGHT, value);
        this.requestLayoutUpdate();
    }
    get right() {
        return this._parseValue(this.node.getPosition(Yoga.EDGE_RIGHT));
    }
    set minWidth(value) {
        this.node.setMinWidth(value);
        this.requestLayoutUpdate();
    }
    get minWidth() {
        return this._parseValue(this.node.getMinWidth());
    }
    set minHeight(value) {
        this.node.setMinHeight(value);
        this.requestLayoutUpdate();
    }
    get minHeight() {
        return this._parseValue(this.node.getMinHeight());
    }
    set maxWidth(value) {
        this.node.setMaxWidth(value);
        this.requestLayoutUpdate();
    }
    get maxWidth() {
        return this._parseValue(this.node.getMaxWidth());
    }
    set maxHeight(value) {
        this.node.setMaxHeight(value);
        this.requestLayoutUpdate();
    }
    get maxHeight() {
        return this._parseValue(this.node.getMaxHeight());
    }
    set display(value) {
        this.node.setDisplay(YogaConstants.Display[value]);
        this.requestLayoutUpdate();
    }
    get display() {
        // @ts-ignore
        return Display[this.node.getDisplay()];
    }
    set gap(val) {
        if (this._gap === val) {
            return;
        }
        this._gap = val;
        this.updateGap();
        this.requestLayoutUpdate();
    }
    get gap() {
        return this._gap;
    }
    updateGap() {
        if (!this._gap) {
            return;
        }
        let firstChildrenSkipped = false;
        this.children.forEach((child, index) => {
            if (firstChildrenSkipped) {
                this.flexDirection === "column" ? child.marginTop = this._gap : child.marginLeft = this._gap;
            }
            if (child.position !== "absolute") {
                firstChildrenSkipped = true;
            }
        });
    }
    _parseValue(value) {
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
    }
}
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
