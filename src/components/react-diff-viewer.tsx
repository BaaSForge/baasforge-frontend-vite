"use client";

import type { ReactElement } from "react";
import ReactDiffViewerBase, {
    DiffMethod,
    type ReactDiffViewerProps,
    type ReactDiffViewerStylesOverride,
} from "react-diff-viewer-continued";

export type { ReactDiffViewerProps };

export type ReactDiffViewerExtendedProps = ReactDiffViewerProps & {
    /**
     * Title row when `splitView` is false. The underlying library only shows `leftTitle` in that
     * mode; this prop sets that label without overloading `leftTitle` when split titles differ.
     */
    inlineTitle?: string | ReactElement;
};

export function ReactDiffViewer({
    inlineTitle,
    splitView = true,
    leftTitle,
    rightTitle,
    ...rest
}: ReactDiffViewerExtendedProps) {
    if (splitView) {
        return (
            <ReactDiffViewerBase
                {...rest}
                splitView={splitView}
                leftTitle={leftTitle}
                rightTitle={rightTitle}
            />
        );
    }

    return (
        <ReactDiffViewerBase
            {...rest}
            splitView={false}
            leftTitle={inlineTitle !== undefined ? inlineTitle : leftTitle}
            rightTitle={undefined}
        />
    );
}

export default ReactDiffViewer;

export { DiffMethod };
export type { ReactDiffViewerStylesOverride };
