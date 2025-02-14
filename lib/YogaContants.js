import * as yoga from "yoga-layout-prebuilt-low-memory";
export var YogaConstants;
(function (YogaConstants) {
    let FlexDirection;
    (function (FlexDirection) {
        FlexDirection[FlexDirection["column"] = yoga.FLEX_DIRECTION_COLUMN] = "column";
        FlexDirection[FlexDirection["column-reverse"] = yoga.FLEX_DIRECTION_COLUMN_REVERSE] = "column-reverse";
        FlexDirection[FlexDirection["row"] = yoga.FLEX_DIRECTION_ROW] = "row";
        FlexDirection[FlexDirection["row-reverse"] = yoga.FLEX_DIRECTION_ROW_REVERSE] = "row-reverse";
    })(FlexDirection = YogaConstants.FlexDirection || (YogaConstants.FlexDirection = {}));
    let JustifyContent;
    (function (JustifyContent) {
        JustifyContent[JustifyContent["flex-start"] = yoga.JUSTIFY_FLEX_START] = "flex-start";
        JustifyContent[JustifyContent["flex-end"] = yoga.JUSTIFY_FLEX_END] = "flex-end";
        JustifyContent[JustifyContent["center"] = yoga.JUSTIFY_CENTER] = "center";
        JustifyContent[JustifyContent["space-between"] = yoga.JUSTIFY_SPACE_BETWEEN] = "space-between";
        JustifyContent[JustifyContent["space-around"] = yoga.JUSTIFY_SPACE_AROUND] = "space-around";
        JustifyContent[JustifyContent["space-evenly"] = yoga.JUSTIFY_SPACE_EVENLY] = "space-evenly";
    })(JustifyContent = YogaConstants.JustifyContent || (YogaConstants.JustifyContent = {}));
    let FlexWrap;
    (function (FlexWrap) {
        FlexWrap[FlexWrap["wrap"] = yoga.WRAP_WRAP] = "wrap";
        FlexWrap[FlexWrap["no-wrap"] = yoga.WRAP_NO_WRAP] = "no-wrap";
        FlexWrap[FlexWrap["wrap-reverse"] = yoga.WRAP_WRAP_REVERSE] = "wrap-reverse";
    })(FlexWrap = YogaConstants.FlexWrap || (YogaConstants.FlexWrap = {}));
    let Align;
    (function (Align) {
        Align[Align["stretch"] = yoga.ALIGN_STRETCH] = "stretch";
        Align[Align["auto"] = yoga.ALIGN_AUTO] = "auto";
        Align[Align["baseline"] = yoga.ALIGN_BASELINE] = "baseline";
        Align[Align["center"] = yoga.ALIGN_CENTER] = "center";
        Align[Align["flex-start"] = yoga.ALIGN_FLEX_START] = "flex-start";
        Align[Align["flex-end"] = yoga.ALIGN_FLEX_END] = "flex-end";
        Align[Align["space-between"] = yoga.ALIGN_SPACE_BETWEEN] = "space-between";
        Align[Align["space-around"] = yoga.ALIGN_SPACE_AROUND] = "space-around";
    })(Align = YogaConstants.Align || (YogaConstants.Align = {}));
    let PositionType;
    (function (PositionType) {
        PositionType[PositionType["relative"] = yoga.POSITION_TYPE_RELATIVE] = "relative";
        PositionType[PositionType["absolute"] = yoga.POSITION_TYPE_ABSOLUTE] = "absolute";
    })(PositionType = YogaConstants.PositionType || (YogaConstants.PositionType = {}));
    let Display;
    (function (Display) {
        Display[Display["flex"] = yoga.DISPLAY_FLEX] = "flex";
        Display[Display["none"] = yoga.DISPLAY_NONE] = "none";
    })(Display = YogaConstants.Display || (YogaConstants.Display = {}));
    let YogaCustomSizeConfig;
    (function (YogaCustomSizeConfig) {
        YogaCustomSizeConfig["AUTO"] = "auto";
        YogaCustomSizeConfig["SCREEN_SIZE"] = "screen";
        YogaCustomSizeConfig["WINDOW_SIZE"] = "window";
    })(YogaCustomSizeConfig = YogaConstants.YogaCustomSizeConfig || (YogaConstants.YogaCustomSizeConfig = {}));
    YogaConstants.YogaEdges = [yoga.EDGE_TOP, yoga.EDGE_RIGHT, yoga.EDGE_BOTTOM, yoga.EDGE_LEFT];
})(YogaConstants || (YogaConstants = {}));
