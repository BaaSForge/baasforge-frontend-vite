import { getToolArgumentsTooltipHeadingAndBody } from "@/modules/project-chat/types";

export function ToolMessageArgsTooltipBlocks({
    formattedArgs,
    payloadRaw,
    omitParsedArgumentsHeading,
}: {
    formattedArgs: string;
    payloadRaw?: unknown | null;
    /** Use under a primary tooltip title when parsed args should appear without an "Arguments" sub-heading. */
    omitParsedArgumentsHeading?: boolean;
}) {
    const { heading, body } = getToolArgumentsTooltipHeadingAndBody(formattedArgs, payloadRaw, {
        omitParsedArgumentsHeading,
    });
    return (
        <>
            {heading != null ? <span className="font-medium">{heading}</span> : null}
            <span className="mt-0.5 block whitespace-pre-line break-words text-muted-foreground">
                {body}
            </span>
        </>
    );
}
