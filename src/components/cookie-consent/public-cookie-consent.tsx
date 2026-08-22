import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    COOKIE_CATEGORY_DEFINITIONS,
    useCookieConsentActions,
    useCookieConsentPreferences,
    useCookieConsentSettingsOpen,
    useHasCookieConsentResponded,
    type CookieConsentPreferences,
} from "@/services/cookie-consent";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

type CookieConsentDraft = Pick<CookieConsentPreferences, "analytics" | "marketing">;

function CookieBanner() {
    const { acceptAll, rejectAll, openSettings } = useCookieConsentActions();

    return (
        <section
            aria-label="Cookie consent"
            className="bg-background fixed bottom-4 left-1/2 z-modal flex max-h-[min(80dvh,28rem)] w-[min(42rem,calc(100%-2rem))] -translate-x-1/2 flex-col gap-4 rounded-lg border p-4 shadow-lg"
        >
            <div className="space-y-1.5">
                <h2 className="font-semibold">We use cookies</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    We use strictly necessary cookies to run the site. With your permission, we may also use analytics
                    and marketing cookies. See our{" "}
                    <Link
                        className="text-foreground underline underline-offset-4 hover:text-foreground/80"
                        to="/privacy-policy"
                        reloadDocument
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={openSettings}>
                    Cookie settings
                </Button>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={rejectAll}>
                        Reject non-essential
                    </Button>
                    <Button type="button" className="w-full sm:w-auto" onClick={acceptAll}>
                        Accept all
                    </Button>
                </div>
            </div>
        </section>
    );
}

function CookieSettingsDialog({ preferences }: { preferences: CookieConsentPreferences | null }) {
    const { acceptAll, rejectAll, setPreferences, setSettingsOpen } = useCookieConsentActions();
    const [draft, setDraft] = useState<CookieConsentDraft>({
        analytics: preferences?.analytics ?? false,
        marketing: preferences?.marketing ?? false,
    });

    return (
        <DialogPrimitive.Root open onOpenChange={setSettingsOpen}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-modal bg-black/50" />
                <DialogPrimitive.Content className="bg-background fixed top-1/2 left-1/2 z-modal flex max-h-[calc(100dvh-2rem)] w-[min(32rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-5 overflow-y-auto rounded-lg border p-6 shadow-lg outline-none">
                    <div className="space-y-1.5 pr-8">
                        <DialogPrimitive.Title className="text-lg font-semibold">Cookie settings</DialogPrimitive.Title>
                        <DialogPrimitive.Description className="text-muted-foreground text-sm leading-relaxed">
                            Choose which cookies we may use. Strictly necessary cookies are always on. Details are in
                            our{" "}
                            <Link
                                className="text-foreground underline underline-offset-4 hover:text-foreground/80"
                                to="/privacy-policy"
                                reloadDocument
                            >
                                Privacy Policy
                            </Link>
                            .
                        </DialogPrimitive.Description>
                    </div>
                    <DialogPrimitive.Close
                        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-4 right-4 grid size-8 place-items-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
                        aria-label="Close cookie settings"
                    >
                        <XIcon className="size-4" aria-hidden="true" />
                    </DialogPrimitive.Close>

                    <ul className="flex flex-col gap-5">
                        {COOKIE_CATEGORY_DEFINITIONS.map((category) => {
                            const checked = category.required
                                ? true
                                : category.id === "analytics"
                                  ? draft.analytics
                                  : draft.marketing;
                            const switchId = `public-cookie-category-${category.id}`;

                            return (
                                <li key={category.id} className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 space-y-1">
                                        <label htmlFor={switchId} className="text-sm leading-snug font-medium">
                                            {category.title}
                                            {category.required ? (
                                                <span className="text-muted-foreground font-normal"> · Always on</span>
                                            ) : null}
                                        </label>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {category.description}
                                        </p>
                                    </div>
                                    <SwitchPrimitive.Root
                                        id={switchId}
                                        checked={checked}
                                        disabled={category.required}
                                        onCheckedChange={(next) => {
                                            if (category.id === "analytics") {
                                                setDraft({ ...draft, analytics: next });
                                            } else if (category.id === "marketing") {
                                                setDraft({ ...draft, marketing: next });
                                            }
                                        }}
                                        aria-label={category.title}
                                        className={cn(
                                            "bg-input focus-visible:ring-ring/50 relative mt-0.5 inline-flex h-[1.15rem] w-8 shrink-0 rounded-full border border-transparent outline-none focus-visible:ring-[3px] disabled:opacity-50",
                                            "data-[state=checked]:bg-primary",
                                        )}
                                    >
                                        <SwitchPrimitive.Thumb className="bg-background block size-4 rounded-full transition-transform data-[state=checked]:translate-x-[calc(100%-2px)]" />
                                    </SwitchPrimitive.Root>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button type="button" variant="outline" onClick={rejectAll}>
                                Reject all
                            </Button>
                            <Button type="button" onClick={acceptAll}>
                                Allow all
                            </Button>
                        </div>
                        <Button type="button" variant="secondary" onClick={() => setPreferences(draft)}>
                            Save preferences
                        </Button>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

export function PublicCookieConsentHost() {
    const hasResponded = useHasCookieConsentResponded();
    const settingsOpen = useCookieConsentSettingsOpen();
    const preferences = useCookieConsentPreferences();

    if (settingsOpen) return <CookieSettingsDialog preferences={preferences} />;
    if (!hasResponded) return <CookieBanner />;
    return null;
}
