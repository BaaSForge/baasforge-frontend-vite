declare module "react-diff-viewer-compute-lines" {
    import type { Change } from "diff";

    export enum DiffType {
        DEFAULT = 0,
        ADDED = 1,
        REMOVED = 2,
        CHANGED = 3,
    }

    export enum DiffMethod {
        CHARS = "diffChars",
        WORDS = "diffWords",
        WORDS_WITH_SPACE = "diffWordsWithSpace",
        LINES = "diffLines",
        TRIMMED_LINES = "diffTrimmedLines",
        SENTENCES = "diffSentences",
        CSS = "diffCss",
        JSON = "diffJson",
        YAML = "diffYaml",
    }

    export interface DiffInformation {
        value?: string | DiffInformation[];
        lineNumber?: number;
        type?: DiffType;
        rawValue?: string;
    }

    export interface LineInformation {
        left?: DiffInformation;
        right?: DiffInformation;
    }

    export interface ComputedLineInformation {
        lineInformation: LineInformation[];
        diffLines: number[];
    }

    export function computeLineInformation(
        oldString: string | Record<string, unknown>,
        newString: string | Record<string, unknown>,
        disableWordDiff?: boolean,
        lineCompareMethod?: DiffMethod | ((oldStr: string, newStr: string) => Change[]),
        linesOffset?: number,
        showLines?: string[],
        deferWordDiff?: boolean,
    ): ComputedLineInformation;
}
