export class YogaAnimationManager {
    constructor() {
        this.animations = [];
    }
    update(delta) {
        delta *= 16.6;
        const toDelete = [];
        for (const anim of this.animations) {
            anim.elapsed += delta;
            let progress = anim.easing(anim.elapsed / anim.time);
            if (progress > 1) {
                progress = 1;
                toDelete.push(anim);
            }
            anim.curX = anim.fromX + (anim.toX - anim.fromX) * progress;
            anim.curY = anim.fromY + (anim.toY - anim.fromY) * progress;
        }
        for (const anim of toDelete) {
            this.remove(anim);
        }
    }
    add(anim) {
        this.animations.push(anim);
    }
    remove(anim) {
        this.animations.splice(this.animations.indexOf(anim), 1);
    }
}
export const yogaAnimationManager = new YogaAnimationManager();
