declare module "pixi.js" {
    interface Container {
        /**
         * True to enable flex for direct children. See also: flexRecursive
         */
        flex: boolean;
        /**
         * True to enable flex for ALL children. See also: flex
         */
        flexRecursive: boolean;
    }
}
export declare function applyContainerPolyfill(proto?: any): void;
