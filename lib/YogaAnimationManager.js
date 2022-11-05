"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yogaAnimationManager = exports.YogaAnimationManager = void 0;
var YogaAnimationManager = /** @class */ (function () {
    function YogaAnimationManager() {
        this.animations = [];
    }
    YogaAnimationManager.prototype.update = function (delta) {
        delta *= 16.6;
        var toDelete = [];
        for (var _i = 0, _a = this.animations; _i < _a.length; _i++) {
            var anim = _a[_i];
            anim.elapsed += delta;
            var progress = anim.easing(anim.elapsed / anim.time);
            if (progress > 1) {
                progress = 1;
                toDelete.push(anim);
            }
            anim.curX = anim.fromX + (anim.toX - anim.fromX) * progress;
            anim.curY = anim.fromY + (anim.toY - anim.fromY) * progress;
        }
        for (var _b = 0, toDelete_1 = toDelete; _b < toDelete_1.length; _b++) {
            var anim = toDelete_1[_b];
            this.remove(anim);
        }
    };
    YogaAnimationManager.prototype.add = function (anim) {
        this.animations.push(anim);
    };
    YogaAnimationManager.prototype.remove = function (anim) {
        this.animations.splice(this.animations.indexOf(anim), 1);
    };
    return YogaAnimationManager;
}());
exports.YogaAnimationManager = YogaAnimationManager;
exports.yogaAnimationManager = new YogaAnimationManager();
