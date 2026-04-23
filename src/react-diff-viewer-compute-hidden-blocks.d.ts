declare module "react-diff-viewer-compute-hidden-blocks" {
    import type { LineInformation } from "react-diff-viewer-compute-lines";

    export type FoldBlock = {
        index: number;
        startLine: number;
        endLine: number;
        lines: number;
    };

    export function computeHiddenBlocks(
        lineInformation: LineInformation[],
        diffLines: number[],
        extraLines: number,
    ): { lineBlocks: Record<number, number>; blocks: FoldBlock[] };
}
