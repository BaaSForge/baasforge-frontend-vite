"use client";

import * as React from "react";

import {
    CentricModal,
    CentricModalContent,
    CentricModalFooter,
    CentricModalHeader,
    CentricModalTitle,
} from "@/components/ui/centric-modal";
import { Button } from "@/components/ui/button";
import { FreeformMultiCombobox } from "@/components/ui/freeform-multi-combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FlaskConical, Play, Rocket } from "lucide-react";

import { StartDebugModalBgIllustration } from "./start-debug-modal-bg";

type StartDebugModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function StartDebugModal({ open, onOpenChange }: StartDebugModalProps) {
    const [traceIds, setTraceIds] = React.useState<string[]>([]);
    const [releaseEnv, setReleaseEnv] = React.useState<"production" | "stage">("stage");
    const [releaseRevision, setReleaseRevision] = React.useState("");

    React.useEffect(() => {
        if (!open) return;
        setTraceIds([]);
        setReleaseEnv("stage");
        setReleaseRevision("");
    }, [open]);

    return (
        <CentricModal open={open} onOpenChange={onOpenChange}>
            <CentricModalContent
                className="w-full max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-5xl"
                bodyScroll={false}
                showCloseButton
                decorator={<StartDebugModalBgIllustration />}
            >
                <CentricModalHeader className="bg-transparent">
                    <CentricModalTitle>Start Debug</CentricModalTitle>
                </CentricModalHeader>
                <div className="flex w-full min-h-0 flex-1 flex-col justify-start sm:justify-center py-10">
                    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch sm:gap-x-6 sm:gap-y-0">
                        <FreeformMultiCombobox
                            id="start-debug-trace-ids"
                            label="by trace id"
                            placeholder="Trace id, press Enter to add multiple"
                            value={traceIds}
                            onValueChange={setTraceIds}
                            className="gap-3 md:pb-10 md:pt-6"
                            chipsClassName="min-h-9 items-center"
                            labelRowClassName="flex h-7 shrink-0 items-center"
                        />
                        <div
                            role="separator"
                            aria-hidden
                            className="border-border h-0 w-full shrink-0 border-t border-dashed sm:hidden"
                        />
                        <div
                            role="separator"
                            aria-hidden
                            className="border-border hidden w-0 shrink-0 self-stretch border-l border-dashed sm:block"
                        />
                        <div className="flex min-w-0 flex-col gap-3 md:pb-10 md:pt-6">
                            <div className="flex h-7 min-h-7 shrink-0 items-center justify-between gap-2">
                                <Label className="text-muted-foreground shrink-0 text-xs font-medium">by release</Label>
                                <ToggleGroup
                                    type="single"
                                    value={releaseEnv}
                                    onValueChange={(v) => {
                                        if (v === "production" || v === "stage") setReleaseEnv(v);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0"
                                >
                                    <ToggleGroupItem value="stage" className="h-7 min-h-7 gap-1 px-2 text-xs">
                                        <FlaskConical className="size-3 shrink-0" aria-hidden />
                                        stage
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="production" className="h-7 min-h-7 gap-1 px-2 text-xs">
                                        <Rocket className="size-3 shrink-0" aria-hidden />
                                        production
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                            <Input
                                value={releaseRevision}
                                onChange={(e) => setReleaseRevision(e.target.value)}
                                placeholder="release revision e.g. 1.0"
                                className="w-full"
                                autoComplete="off"
                            />
                        </div>
                    </div>
                </div>
                <CentricModalFooter className="flex flex-col items-stretch gap-2">
                    <Button type="button" size="default" disabled className="h-11 w-full gap-2.5 text-base">
                        <Play className="size-4 shrink-0" aria-hidden />
                        let's start
                    </Button>
                </CentricModalFooter>
            </CentricModalContent>
        </CentricModal>
    );
}
