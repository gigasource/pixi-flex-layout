import { YogaLayout } from "./YogaLayout";
declare module "pixi.js" {
    interface DisplayObject {
        yoga: YogaLayout;
        /**
         * Internal property for fast checking if object has yoga
         */
        __hasYoga: boolean;
        /**
         * Applies yoga layout to DisplayObject
         */
        updateYogaLayout(): void;
        /**
         * Checks boundaries of DisplayObject and emits NEED_LAYOUT_UPDATE if needed
         */
        checkIfBoundingBoxChanged(): void;
    }
    interface DisplayObject {
        _yogaLayoutHash: number;
        _prevYogaLayoutHash: number;
        __yoga: YogaLayout;
    }
}
export declare function applyDisplayObjectPolyfill(prototype?: any): void;
