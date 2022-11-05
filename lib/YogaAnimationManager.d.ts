import { IAnimationState } from "./YogaLayout";
export declare class YogaAnimationManager {
    animations: IAnimationState[];
    update(delta: number): void;
    add(anim: IAnimationState): void;
    remove(anim: IAnimationState): void;
}
export declare const yogaAnimationManager: YogaAnimationManager;
