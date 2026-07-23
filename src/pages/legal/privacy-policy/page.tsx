import privacyPolicy from "@/content/legal/privacy-policy.md?raw";
import { LegalPage } from "../legal-page";

export default function PrivacyPolicyPage() {
    return (
        <LegalPage
            canonicalPath="/privacy-policy"
            content={privacyPolicy}
            dateModified="2026-07-23"
            description="Learn how BaaSForge collects, uses, protects, and retains personal data."
            title="Privacy Policy"
        />
    );
}
