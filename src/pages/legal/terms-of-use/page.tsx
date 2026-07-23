import termsOfUse from "@/content/legal/terms-of-use.md?raw";
import { LegalPage } from "../legal-page";

export default function TermsOfUsePage() {
    return (
        <LegalPage
            canonicalPath="/terms-of-use"
            content={termsOfUse}
            dateModified="2026-07-23"
            description="Review the terms governing access to and use of BaaSForge services."
            title="Terms of Use"
        />
    );
}
