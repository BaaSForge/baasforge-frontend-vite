"use client";

import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { Link2Icon, Share2Icon } from "lucide-react";
import { useState } from "react";
import { DocumentationShareModal } from "./documentation-share-modal";

type DocumentationShareBlockProps = {
    projectId: string;
    releaseId: string;
    className?: string;
};

export function DocumentationShareBlock({ projectId, releaseId, className }: DocumentationShareBlockProps) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <Item variant="outline" size="sm" className={cn("bg-card shadow-xs", className)}>
                <ItemMedia variant="icon">
                    <Link2Icon className="size-4" aria-hidden />
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>Share documentation</ItemTitle>
                    <ItemDescription>Create a public link so others can view your project documentation.</ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Button type="button" size="sm" onClick={() => setModalOpen(true)}>
                        <Share2Icon className="size-4" />
                        Share
                    </Button>
                </ItemActions>
            </Item>
            <DocumentationShareModal
                projectId={projectId}
                releaseId={releaseId}
                open={modalOpen}
                onOpenChange={setModalOpen}
            />
        </>
    );
}
