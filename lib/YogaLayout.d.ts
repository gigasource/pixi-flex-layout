import * as Yoga from "yoga-layout-prebuilt-low-memory";
import * as PIXI from "pixi.js";
import { YogaConstants } from "./YogaContants";
import { YogaLayoutConfig } from "./YogaLayoutConfig";
import DisplayObject = PIXI.DisplayObject;
import ComputedLayout = YogaConstants.ComputedLayout;
import FlexDirection = YogaConstants.FlexDirection;
import JustifyContent = YogaConstants.JustifyContent;
import Align = YogaConstants.Align;
import FlexWrap = YogaConstants.FlexWrap;
import Display = YogaConstants.Display;
import PositionType = YogaConstants.PositionType;
export declare type PixelsOrPercentage = number | string;
export declare type YogaSize = PixelsOrPercentage | "pixi" | "auto";
export interface IAnimationState {
    fromX: number;
    fromY: number;
    curX: number;
    curY: number;
    toX: number;
    toY: number;
    time: number;
    elapsed: number;
    easing: (progress: number) => number;
}
export interface IYogaAnimationConfig {
    time: number;
    easing: (progress: number) => number;
    shouldRunAnimation?(yoga: YogaLayout, prev: ComputedLayout, newLayout: ComputedLayout): boolean;
}
export declare class YogaLayout {
    /**
     * Internal value. True if we are currently in WebGLRenderer.render() (based on 'prerender' and 'postrender' events). Used to skip some updateTransform calls.
     */
    static isRendering: boolean;
    /**
     * Experimental feature for building layouts independent of pixi tree
     */
    static roots: Map<string, YogaLayout>;
    static readonly LAYOUT_UPDATED_EVENT = "LAYOUT_UPDATED_EVENT";
    static readonly AFTER_LAYOUT_UPDATED_EVENT = "AFTER_LAYOUT_UPDATED_EVENT";
    static readonly NEED_LAYOUT_UPDATE = "NEED_LAYOUT_UPDATE";
    readonly target: DisplayObject;
    readonly node: Yoga.YogaNode;
    children: YogaLayout[];
    parent?: YogaLayout;
    /**
     * If set, position transitions will be animated
     */
    animationConfig: IYogaAnimationConfig;
    /**
     * True if Yoga should manage PIXI objects width/height
     */
    rescaleToYoga: boolean;
    /**
     * If true and rescaleToYoga===true, resizing will keep aspect ratio of obejct.
     * Defaults to true on PIXI.Text and PIXI.Sprite.
     */
    keepAspectRatio: boolean | undefined;
    aspectRatioMainDiemension: "height" | "width";
    private _width;
    private _height;
    private _cachedLayout;
    private _lastLayout;
    private _lastRecalculationDuration;
    private _animation;
    /**
     * Will be recalculated in next frame
     */
    private _needUpdateAsRoot;
    /**
     * Used instead of Yoga.AspectRatio because of Yoga issue https://github.com/facebook/yoga/issues/677
     */
    private _aspectRatio;
    private _gap;
    /**
     * Internal values stored to reduce calls to nbind
     */
    private _marginTop;
    private _marginLeft;
    constructor(pixiObject?: DisplayObject);
    get animationState(): Readonly<IAnimationState>;
    set root(val: string);
    /**
     * Assigns given properties to this yoga layout
     * @param config
     */
    fromConfig(config: YogaLayoutConfig): void;
    /**
     * Same as 'fromConfig()'
     * @param config
     */
    set config(config: YogaLayoutConfig);
    /**
     * Copies all properties (styles, size, rescaleToYoga etc) from other YogaLayout objects
     * @param layout
     */
    copy(layout: YogaLayout): void;
    fillDefaults(): void;
    addChild(yoga: YogaLayout, index?: any): void;
    removeChild(yoga: YogaLayout): void;
    /**
     * Mark object as dirty and request layout recalculation
     */
    requestLayoutUpdate(): void;
    recalculateLayout(): void;
    update(): void;
    get isRoot(): boolean;
    /**
     * Returns true if object size is independent of its children sizes.
     */
    get hasContantDeclaredSize(): boolean;
    willLayoutWillBeRecomputed(): boolean;
    getComputedLayout(): ComputedLayout;
    set aspectRatio(value: number);
    get aspectRatio(): number;
    get isWidthCalculatedFromPixi(): boolean;
    get isHeightCalculatedFromPixi(): boolean;
    /**
     * Returns computed width in pixels
     */
    get calculatedWidth(): number;
    /**
     * Returns computed height in pixels
     */
    get calculatedHeight(): number;
    /**
     * Can handle:
     * - pixels (eg 150)
     * - percents ("50%")
     * - "auto" to use values from yoga
     * - "pixi" to use DisplayObject.width/height
     * @param value
     */
    set width(value: YogaSize);
    get width(): YogaSize;
    /**
     * Can handle:
     * - pixels (eg 150)
     * - percents ("50%")
     * - "auto" to use values from yoga
     * - "pixi" to use DisplayObject.width/height
     * @param value
     */
    set height(value: YogaSize);
    get height(): YogaSize;
    set flexDirection(direction: keyof typeof FlexDirection);
    get flexDirection(): keyof typeof FlexDirection;
    set justifyContent(just: keyof typeof JustifyContent);
    get justifyContent(): keyof typeof JustifyContent;
    set alignContent(align: keyof typeof Align);
    get alignContent(): keyof typeof Align;
    set alignItems(align: keyof typeof Align);
    get alignItems(): keyof typeof Align;
    set alignSelf(align: keyof typeof Align);
    get alignSelf(): keyof typeof Align;
    set flexWrap(wrap: keyof typeof FlexWrap);
    get flexWrap(): keyof typeof FlexWrap;
    set flexGrow(grow: number);
    get flexGrow(): number;
    set flexShrink(shrink: number);
    get flexShrink(): number;
    set flexBasis(basis: number);
    get flexBasis(): number;
    set position(type: keyof typeof PositionType);
    get position(): keyof typeof PositionType;
    set padding(margin: number[]);
    get padding(): number[];
    set paddingAll(value: number);
    set paddingTop(value: number);
    get paddingTop(): number;
    set paddingBottom(value: number);
    get paddingBottom(): number;
    set paddingLeft(value: number);
    get paddingLeft(): number;
    set paddingRight(value: number);
    get paddingRight(): number;
    set margin(margin: number[]);
    set marginAll(value: number);
    get margin(): number[];
    set marginTop(value: number);
    get marginTop(): number;
    set marginBottom(value: number);
    get marginBottom(): number;
    set marginLeft(value: number);
    get marginLeft(): number;
    set marginRight(value: number);
    get marginRight(): number;
    set border(margin: number[]);
    get border(): number[];
    set borderAll(value: number);
    set borderTop(value: number);
    get borderTop(): number;
    set borderBottom(value: number);
    get borderBottom(): number;
    set borderLeft(value: number);
    get bordereft(): number;
    set borderRight(value: number);
    get borderRight(): number;
    set top(value: PixelsOrPercentage);
    get top(): PixelsOrPercentage;
    set bottom(value: PixelsOrPercentage);
    get bottom(): PixelsOrPercentage;
    set left(value: PixelsOrPercentage);
    get left(): PixelsOrPercentage;
    set right(value: PixelsOrPercentage);
    get right(): PixelsOrPercentage;
    set minWidth(value: PixelsOrPercentage);
    get minWidth(): PixelsOrPercentage;
    set minHeight(value: PixelsOrPercentage);
    get minHeight(): PixelsOrPercentage;
    set maxWidth(value: PixelsOrPercentage);
    get maxWidth(): PixelsOrPercentage;
    set maxHeight(value: PixelsOrPercentage);
    get maxHeight(): PixelsOrPercentage;
    set display(value: keyof typeof Display);
    get display(): keyof typeof Display;
    set gap(val: number);
    get gap(): number;
    updateGap(): void;
    private _parseValue;
}
