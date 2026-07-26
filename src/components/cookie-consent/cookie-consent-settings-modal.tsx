import { Button } from "@/components/ui/button";
import {
    CentricModal,
    CentricModalContent,
    CentricModalDescription,
    CentricModalFooter,
    CentricModalHeader,
    CentricModalTitle,
} from "@/components/ui/centric-modal";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    COOKIE_CATEGORY_DEFINITIONS,
    useCookieConsentActions,
    useCookieConsentPreferences,
    useCookieConsentSettingsOpen,
    type CookieConsentPreferences,
} from "@/services/cookie-consent";
import { useEffect, useState } from "react";
import { Link } from "react-router";

type CookieConsentDraft = Pick<CookieConsentPreferences, "analytics" | "marketing">;

function CookieConsentCategories({
    draft,
    onDraftChange,
}: {
    draft: CookieConsentDraft;
    onDraftChange: (next: CookieConsentDraft) => void;
}) {
    return (
        <ul className="mt-4 flex flex-col gap-5">
            {COOKIE_CATEGORY_DEFINITIONS.map((category) => {
                const checked = category.required
                    ? true
                    : category.id === "analytics"
                      ? draft.analytics
                      : draft.marketing;
                const switchId = `cookie-category-${category.id}`;
                return (
                    <li key={category.id} className="flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-1">
                            <Label htmlFor={switchId} className="text-sm font-medium leading-snug">
                                {category.title}
                                {category.required ? (
                                    <span className="text-muted-foreground font-normal"> · Always on</span>
                                ) : null}
                            </Label>
                            <p className="text-muted-foreground text-sm leading-relaxed">{category.description}</p>
                        </div>
                        <Switch
                            id={switchId}
                            checked={checked}
                            disabled={category.required}
                            onCheckedChange={(next) => {
                                if (category.id === "analytics") {
                                    onDraftChange({ ...draft, analytics: next });
                                    return;
                                }
                                if (category.id === "marketing") {
                                    onDraftChange({ ...draft, marketing: next });
                                }
                            }}
                            aria-label={category.title}
                        />
                    </li>
                );
            })}
        </ul>
    );
}

export function CookieConsentSettingsModal() {
    const open = useCookieConsentSettingsOpen();
    const preferences = useCookieConsentPreferences();
    const { acceptAll, rejectAll, setPreferences, setSettingsOpen } = useCookieConsentActions();
    const [draft, setDraft] = useState<CookieConsentDraft>({
        analytics: preferences?.analytics ?? false,
        marketing: preferences?.marketing ?? false,
    });

    useEffect(() => {
        if (!open) return;
        setDraft({
            analytics: preferences?.analytics ?? false,
            marketing: preferences?.marketing ?? false,
        });
    }, [open, preferences]);

    return (
        <CentricModal open={open} onOpenChange={setSettingsOpen} dismissOnOverlayClick>
            <CentricModalContent className="sm:max-w-lg" showCloseButton fillViewportOnMobile>
                <CentricModalHeader className="gap-1.5 text-left group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left">
                    <CentricModalTitle>Cookie settings</CentricModalTitle>
                    <CentricModalDescription className="text-left">
                        Choose which cookies we may use. Strictly necessary cookies are always on. Details are in our{" "}
                        <Link
                            className="text-foreground underline underline-offset-4 hover:text-foreground/80"
                            to="/privacy-policy"
                            reloadDocument
                        >
                            Privacy Policy
                        </Link>
                        .
                    </CentricModalDescription>
                </CentricModalHeader>

                <CookieConsentCategories draft={draft} onDraftChange={setDraft} />

                <CentricModalFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => rejectAll()}>
                            Reject all
                        </Button>
                        <Button type="button" className="w-full sm:w-auto" onClick={() => acceptAll()}>
                            Allow all
                        </Button>
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        className="w-full sm:w-auto"
                        onClick={() => setPreferences(draft)}
                    >
                        Save preferences
                    </Button>
                </CentricModalFooter>
            </CentricModalContent>
        </CentricModal>
    );
}
