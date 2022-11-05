export declare namespace YogaConstants {
    enum FlexDirection {
        "column",
        "column-reverse",
        "row",
        "row-reverse"
    }
    enum JustifyContent {
        "flex-start",
        "flex-end",
        "center",
        "space-between",
        "space-around",
        "space-evenly"
    }
    enum FlexWrap {
        "wrap",
        "no-wrap",
        "wrap-reverse"
    }
    enum Align {
        "stretch",
        "auto",
        "baseline",
        "center",
        "flex-start",
        "flex-end",
        "space-between",
        "space-around"
    }
    enum PositionType {
        "relative",
        "absolute"
    }
    enum Display {
        "flex",
        "none"
    }
    enum YogaCustomSizeConfig {
        AUTO = "auto",
        SCREEN_SIZE = "screen",
        WINDOW_SIZE = "window"
    }
    const YogaEdges: any[];
    interface ComputedLayout {
        left: number;
        right: number;
        top: number;
        bottom: number;
        width: number;
        height: number;
    }
}
