// BaaSForge Recipe Book — Complete 78 Production Recipes
// Version 2.0 (7 November 2026)

export type RecipeLevel = 1 | 2 | 3 | 4;

export type Audience = "B2B" | "B2C" | "Internal";

export type Difficulty = "Simple" | "Medium" | "Advanced";

export interface RecipeItem {
    id: number;
    title: string;
    level: RecipeLevel;
    category: string;
    audience: Audience[];
    difficulty: Difficulty;
    promise: string;
    whatYouCanBuild: string[];
    howItWorks: string[];
    youllNeed: string;
    watchOut: string;
    productTags: string[];
    relatedRecipes: number[];
    promptText: string;
}

export interface LevelInfo {
    level: RecipeLevel;
    title: string;
    subtitle: string;
    count: number;
}

export const RECIPE_LEVELS: LevelInfo[] = [
    {
        level: 1,
        title: "Level 1 — The basics",
        subtitle: "What almost every product needs on day one.",
        count: 18,
    },
    {
        level: 2,
        title: "Level 2 — Common",
        subtitle: "The next requests once you are live.",
        count: 20,
    },
    {
        level: 3,
        title: "Level 3 — Scale & Reliability",
        subtitle: "When traffic and transactions scale, this ensures high availability and data integrity.",
        count: 22,
    },
    {
        level: 4,
        title: "Level 4 — Specialist",
        subtitle: "For technical teams and products that need more precision.",
        count: 18,
    },
];

export const PRODUCT_TAGS = [
    { tag: "SaaS", count: 47 },
    { tag: "AI & Automation", count: 12 },
    { tag: "Fintech & Payments", count: 27 },
    { tag: "E-commerce", count: 27 },
    { tag: "Marketplace", count: 13 },
    { tag: "Internal Tools", count: 17 },
    { tag: "Media & Content", count: 12 },
    { tag: "Education", count: 10 },
    { tag: "Logistics", count: 9 },
    { tag: "Healthcare", count: 8 },
    { tag: "Social & Community", count: 8 },
    { tag: "Booking & Scheduling", count: 5 },
    { tag: "Games", count: 4 },
    { tag: "HR & Recruiting", count: 4 },
    { tag: "Travel", count: 4 },
    { tag: "IoT & Hardware", count: 1 },
] as const;

export const EXTERNAL_NEEDS = [
    { need: "No external service", count: 41 },
    { need: "Email", count: 9 },
    { need: "File storage", count: 9 },
    { need: "Payments", count: 8 },
    { need: "AI model", count: 6 },
    { need: "SMS", count: 4 },
    { need: "Push", count: 1 },
    { need: "Vector index", count: 1 },
    { need: "Calendar", count: 1 },
    { need: "Identity check", count: 1 },
    { need: "E-signature", count: 1 },
    { need: "MQTT", count: 1 },
    { need: "FX rates", count: 1 },
] as const;

export const CYCLING_PLACEHOLDERS = [
    "User auth with Google login, magic links, password reset, and JWT sessions...",
    "Stripe subscription checkout with monthly billing and webhook alerts...",
    "AI agent that remembers conversation history and answers from my uploaded docs...",
    "Background queue worker to send emails, retry on failure, and generate PDFs...",
    "Multi-tenant team workspaces with invite links and member permissions...",
    "User wallet balance with deposits, withdrawals, and double-entry transaction history...",
];

export const SUGGESTED_PROMPTS = [
    {
        id: "auth",
        label: "User Auth",
        prompt: "User auth with email verification, password reset, and secure JWT sessions.",
        icon: "users",
    },
    {
        id: "checkout",
        label: "Stripe Billing",
        prompt: "Stripe checkout with monthly subscriptions, customer portal, and webhook handler.",
        icon: "credit-card",
    },
    {
        id: "ai-chat",
        label: "AI Chatbot",
        prompt: "AI chatbot that remembers conversation history and answers questions from my documents.",
        icon: "bot",
    },
    {
        id: "queue",
        label: "Email Queue",
        prompt: "Background queue worker to send welcome emails and generate invoice PDFs.",
        icon: "workflow",
    },
    {
        id: "workspaces",
        label: "Team Workspaces",
        prompt: "Team workspaces with member invite links, owner roles, and permissions.",
        icon: "users",
    },
    {
        id: "wallet",
        label: "Payment Ledger",
        prompt: "User wallet balance with deposits, withdrawals, and double-entry transaction history.",
        icon: "credit-card",
    },
];

export const ALL_RECIPES: RecipeItem[] = [
    {
        "id": 1,
        "title": "User accounts and login",
        "level": 1,
        "category": "ACCOUNTS & ACCESS",
        "audience": [
            "B2B",
            "B2C"
        ],
        "difficulty": "Medium",
        "promise": "Give your app sign-up, login, sessions and password reset — without running an auth server.",
        "whatYouCanBuild": [
            "A SaaS with email and password",
            "A members-only area",
            "A mobile app with persistent login"
        ],
        "howItWorks": [
            "The user signs up; the password is hashed and the profile is stored with the user.",
            "Login returns a short-lived token, refreshed by a longer-lived one.",
            "Password reset sends a one-time link that expires."
        ],
        "youllNeed": "An email service (or SMS for login codes).",
        "watchOut": "Keep the token signing key in an encrypted environment variable, never in code.",
        "productTags": [
            "SaaS",
            "Marketplace",
            "Social & Community",
            "Education"
        ],
        "relatedRecipes": [
            2,
            20
        ],
        "promptText": "Build user accounts and auth with password hashing, JWT sessions, refresh tokens, and password reset."
    },
    {
        "id": 2,
        "title": "Profile and settings",
        "level": 1,
        "category": "ACCOUNTS & ACCESS",
        "audience": [
            "B2C",
            "B2B"
        ],
        "difficulty": "Simple",
        "promise": "Every user gets a profile, an avatar, preferences and notification settings.",
        "whatYouCanBuild": [
            "An account page",
            "Language and notification settings",
            "A public profile"
        ],
        "howItWorks": [
            "The profile lives with the user; changes save immediately.",
            "The avatar is stored as a file and its URL is recorded on the profile.",
            "Changing an email or phone number requires a second confirmation."
        ],
        "youllNeed": "File storage for avatars.",
        "watchOut": "Never apply an email change without confirmation; accounts get taken over that way.",
        "productTags": [
            "SaaS",
            "Social & Community",
            "Education"
        ],
        "relatedRecipes": [
            2,
            20
        ],
        "promptText": "Build user profile and settings management with avatar upload, preferences, and verified email update flow."
    },
    {
        "id": 3,
        "title": "Roles and permissions",
        "level": 1,
        "category": "ACCOUNTS & ACCESS",
        "audience": [
            "B2B",
            "Internal"
        ],
        "difficulty": "Medium",
        "promise": "Decide who can do what: admin, staff, customer.",
        "whatYouCanBuild": [
            "An admin panel with several access levels",
            "A sales team with limited access",
            "Customers who only see their own data"
        ],
        "howItWorks": [
            "Define the allowed actions for each role.",
            "Every request checks once, before it runs: is this user allowed?",
            "Changing a role takes effect on the next request."
        ],
        "youllNeed": "None (or an identity provider if you need SSO).",
        "watchOut": "Check permissions on the server; hiding a button in the UI is not a control.",
        "productTags": [
            "SaaS",
            "Internal Tools",
            "Marketplace"
        ],
        "relatedRecipes": [
            54,
            55
        ],
        "promptText": "Build role-based access control (RBAC) with server-side permission checks and dynamic role assignment."
    },
    {
        "id": 4,
        "title": "Transactional email",
        "level": 1,
        "category": "COMMUNICATION",
        "audience": [
            "B2B",
            "B2C"
        ],
        "difficulty": "Simple",
        "promise": "Send welcome mail, receipts, confirmations and password resets reliably.",
        "whatYouCanBuild": [
            "Welcome after sign-up",
            "Payment receipts",
            "Password reset links"
        ],
        "howItWorks": [
            "Email goes into a queue, not into the request path.",
            "If the provider fails, it retries several times.",
            "After repeated failures the message is set aside and the team is alerted."
        ],
        "youllNeed": "An email service (Resend, SES or similar).",
        "watchOut": "Send in the background; a sign-up form should not wait for an email.",
        "productTags": [
            "SaaS",
            "E-commerce",
            "Booking & Scheduling"
        ],
        "relatedRecipes": [
            27
        ],
        "promptText": "Build transactional email delivery worker with queueing, automated exponential backoff retries, and failure alerts."
    },
    {
        "id": 5,
        "title": "File uploads",
        "level": 1,
        "category": "CONTENT & FILES",
        "audience": [
            "B2B",
            "B2C"
        ],
        "difficulty": "Medium",
        "promise": "Let users upload photos, PDFs or video, and hand back a secure link.",
        "whatYouCanBuild": [
            "Document upload in a form",
            "An image gallery",
            "Attachments on a support ticket"
        ],
        "howItWorks": [
            "The app receives the file and sends it to storage.",
            "Metadata (name, size, owner) is stored with the app.",
            "Downloads use a short-lived signed link, not a public URL."
        ],
        "youllNeed": "Object storage (S3, R2 or similar).",
        "watchOut": "Check file type and size before upload; after upload it is too late.",
        "productTags": [
            "SaaS",
            "Media & Content",
            "Education",
            "Healthcare"
        ],
        "relatedRecipes": [
            3,
            28
        ],
        "promptText": "Build secure file upload system with presigned URLs, MIME validation, file size limits, and access expiry."
    },
    {
        "id": 6,
        "title": "Product catalogue",
        "level": 1,
        "category": "COMMERCE",
        "audience": [
            "B2C"
        ],
        "difficulty": "Simple",
        "promise": "Manage products, categories, images and stock, and serve them to your app.",
        "whatYouCanBuild": [
            "A small store",
            "A restaurant menu",
            "A services catalogue"
        ],
        "howItWorks": [
            "Each product is a record with title, price, image and status.",
            "Categories and search run on the same data.",
            "A price or stock change is visible in the app immediately."
        ],
        "youllNeed": "File storage for images.",
        "watchOut": "Keep one source of truth for price; several places will disagree within a week.",
        "productTags": [
            "E-commerce",
            "Marketplace"
        ],
        "relatedRecipes": [
            15,
            30
        ],
        "promptText": "Build product catalog backend with category indexing, real-time stock counts, and price integrity validation."
    },
    {
        "id": 7,
        "title": "Shopping cart",
        "level": 1,
        "category": "COMMERCE",
        "audience": [
            "B2C"
        ],
        "difficulty": "Simple",
        "promise": "Let shoppers add and remove items, keep the cart across visits, and survive two open tabs.",
        "whatYouCanBuild": [
            "An online store",
            "Food ordering",
            "Subscription checkout"
        ],
        "howItWorks": [
            "Each user's cart is stored separately.",
            "Adds and removes are processed in order, so two tabs cannot corrupt the total.",
            "An abandoned cart is cleared automatically after 24 hours."
        ],
        "youllNeed": "None.",
        "watchOut": "Re-check the price at checkout, not only in the cart.",
        "productTags": [
            "E-commerce"
        ],
        "relatedRecipes": [
            2
        ],
        "promptText": "Build persistent shopping cart with actor-isolated state, concurrent tab protection, and price re-verification."
    },
    {
        "id": 8,
        "title": "Checkout and payments",
        "level": 1,
        "category": "MONEY",
        "audience": [
            "B2C"
        ],
        "difficulty": "Medium",
        "promise": "Take payment, record the order, and make sure money never lands in limbo.",
        "whatYouCanBuild": [
            "An online store",
            "Selling subscriptions",
            "Deposits for bookings"
        ],
        "howItWorks": [
            "The order is created and the amount is verified.",
            "Payment runs; if the provider errors, it retries without charging twice.",
            "If the next step fails (say, stock reservation), the payment is refunded automatically."
        ],
        "youllNeed": "A payment provider (Stripe, or your local gateway).",
        "watchOut": "Put a unique key on every order so a retry cannot create a second charge.",
        "productTags": [
            "E-commerce",
            "SaaS",
            "Fintech & Payments"
        ],
        "relatedRecipes": [
            1,
            3,
            10
        ],
        "promptText": "Build payment checkout saga with idempotency keys, payment gateway integration, and automatic refund compensation."
    },
    {
        "id": 9,
        "title": "Orders and fulfillment",
        "level": 1,
        "category": "COMMERCE",
        "audience": [
            "B2C",
            "B2B"
        ],
        "difficulty": "Medium",
        "promise": "From order to delivery, every stage is visible — and a failure unwinds the earlier steps.",
        "whatYouCanBuild": [
            "An online store with shipping",
            "A service with stages",
            "Wholesale orders"
        ],
        "howItWorks": [
            "The order is created and stock is reserved.",
            "Payment, packing and shipping are each a trackable step.",
            "If a step fails, earlier ones are undone and the customer is told."
        ],
        "youllNeed": "Your warehouse, a shipping carrier.",
        "watchOut": "Keep order status in one place; parallel statuses drive support insane.",
        "productTags": [
            "E-commerce",
            "Logistics"
        ],
        "relatedRecipes": [
            1,
            26
        ],
        "promptText": "Build order fulfillment pipeline with stage tracking, inventory reservation, and reverse step compensation on failure."
    },
    {
        "id": 10,
        "title": "Subscriptions and trials",
        "level": 1,
        "category": "MONEY",
        "audience": [
            "B2B",
            "B2C"
        ],
        "difficulty": "Medium",
        "promise": "Sell a monthly plan, give a free trial, and chase failed payments automatically.",
        "whatYouCanBuild": [
            "A subscription SaaS",
            "Monthly membership content",
            "Basic and Pro plans"
        ],
        "howItWorks": [
            "The user picks a plan; the trial starts.",
            "At the end of the trial the charge runs; on failure it retries on days 3, 7 and 14.",
            "If every attempt fails, the plan drops to free and the user is told."
        ],
        "youllNeed": "A payment provider.",
        "watchOut": "Decide mid-cycle plan changes up front, or you will chase billing mismatches.",
        "productTags": [
            "SaaS",
            "Media & Content",
            "Education"
        ],
        "relatedRecipes": [
            13,
            17
        ],
        "promptText": "Build recurring subscription engine with trial periods, dunning schedules (days 3/7/14), and automatic downgrade."
    },
    {
        "id": 11,
        "title": "Search",
        "level": 1,
        "category": "CONTENT & FILES",
        "audience": [
            "B2C",
            "B2B"
        ],
        "difficulty": "Medium",
        "promise": "Let users search products or articles and get relevant results.",
        "whatYouCanBuild": [
            "Store search",
            "Docs search",
            "User search"
        ],
        "howItWorks": [
            "Each record is indexed by title and description.",
            "Queries run against that index and results are ranked.",
            "The index is rebuilt after bulk changes."
        ],
        "youllNeed": "An external search engine for large volumes.",
        "watchOut": "Fine for a few thousand records; for millions you need a separate service.",
        "productTags": [
            "E-commerce",
            "Media & Content",
            "SaaS"
        ],
        "relatedRecipes": [
            30,
            73
        ],
        "promptText": "Build full-text search backend with indexing, ranking, typo tolerance, and asynchronous index rebuild."
    },
    {
        "id": 12,
        "title": "Inbound webhooks",
        "level": 1,
        "category": "INTEGRATIONS",
        "audience": [
            "B2B"
        ],
        "difficulty": "Medium",
        "promise": "Receive events from external services and make sure they are genuine and not repeated.",
        "whatYouCanBuild": [
            "Successful payment from the gateway",
            "Signature event",
            "Shipment status change"
        ],
        "howItWorks": [
            "The event is received and its signature verified.",
            "Duplicate events are rejected by id.",
            "Processing runs in a queue so the response stays fast."
        ],
        "youllNeed": "The external service.",
        "watchOut": "Always verify the signature; the webhook URL is public.",
        "productTags": [
            "Fintech & Payments",
            "SaaS",
            "E-commerce"
        ],
        "relatedRecipes": [
            10,
            57
        ],
        "promptText": "Build secure inbound webhook receiver with HMAC signature verification, deduplication cache, and queue offload."
    },
    {
        "id": 13,
        "title": "Outbound webhooks",
        "level": 1,
        "category": "INTEGRATIONS",
        "audience": [
            "B2B"
        ],
        "difficulty": "Medium",
        "promise": "When something happens, tell the customer's system — signed, with retries.",
        "whatYouCanBuild": [
            "Order updates to a customer system",
            "CRM sync",
            "Zapier integration"
        ],
        "howItWorks": [
            "Each customer registers a URL and a signing secret.",
            "Events are queued and sent with a signature.",
            "If the target fails, it retries and then alerts the team."
        ],
        "youllNeed": "None.",
        "watchOut": "Pause an endpoint after repeated failures, or the queue fills up.",
        "productTags": [
            "SaaS",
            "Internal Tools"
        ],
        "relatedRecipes": [
            36
        ],
        "promptText": "Build outbound webhook dispatcher with customer endpoint registration, HMAC signing, exponential retries, and circuit breaker."
    },
    {
        "id": 14,
        "title": "Admin panel",
        "level": 1,
        "category": "OPERATIONS",
        "audience": [
            "Internal"
        ],
        "difficulty": "Medium",
        "promise": "A screen where support can see status and take the right action.",
        "whatYouCanBuild": [
            "A support console",
            "Correcting an order",
            "Replaying a failed operation"
        ],
        "howItWorks": [
            "Every admin action is a protected route behind a role.",
            "Sensitive operations require a second confirmation.",
            "Every action is logged with the admin's name and time."
        ],
        "youllNeed": "None.",
        "watchOut": "Do not let admins edit data directly; run them through the same logic.",
        "productTags": [
            "Internal Tools",
            "SaaS"
        ],
        "relatedRecipes": [
            35,
            58
        ],
        "promptText": "Build secure admin panel backend with audited operation routes, two-step confirmation, and actor domain isolation."
    },
    {
        "id": 15,
        "title": "Audit log",
        "level": 1,
        "category": "OPERATIONS",
        "audience": [
            "B2B",
            "Internal"
        ],
        "difficulty": "Medium",
        "promise": "Know who changed what, and when — and make it tamper-evident.",
        "whatYouCanBuild": [
            "Internal audit",
            "Investigating human error",
            "An enterprise customer requirement"
        ],
        "howItWorks": [
            "Every important action writes a record.",
            "Records are chained; edits or deletions are detectable.",
            "The report filters by user, time and action type."
        ],
        "youllNeed": "None.",
        "watchOut": "Start on day one; you cannot reconstruct months of history later.",
        "productTags": [
            "Internal Tools",
            "Fintech & Payments",
            "Healthcare"
        ],
        "relatedRecipes": [
            58
        ],
        "promptText": "Build append-only tamper-evident audit logging with hash chaining, actor tracking, and filtered audit queries."
    },
    {
        "id": 16,
        "title": "Support tickets and SLA",
        "level": 1,
        "category": "WORKFLOWS",
        "audience": [
            "B2B"
        ],
        "difficulty": "Medium",
        "promise": "Tickets get recorded, routed to the right person, and escalate when late.",
        "whatYouCanBuild": [
            "Customer support",
            "Internal IT requests",
            "Complaint handling"
        ],
        "howItWorks": [
            "A ticket is created with a priority and assigned to a specialist.",
            "At 70% and 90% of the time limit, a warning fires.",
            "When time runs out it escalates to a manager and the customer is told."
        ],
        "youllNeed": "A support channel (email or chat).",
        "watchOut": "Define the SLA from day one; adding it later confuses everyone.",
        "productTags": [
            "SaaS",
            "Internal Tools",
            "E-commerce"
        ],
        "relatedRecipes": [
            21,
            65,
            66
        ],
        "promptText": "Build support ticket escalation workflow with SLA milestone timers (70%/90%), team routing, and customer status alerts."
    },
    {
        "id": 17,
        "title": "Reminders",
        "level": 1,
        "category": "COMMUNICATION",
        "audience": [
            "B2C"
        ],
        "difficulty": "Simple",
        "promise": "Remind people on time, and follow up if nothing happened.",
        "whatYouCanBuild": [
            "Appointment reminders",
            "Payment follow-ups",
            "Profile completion nudges"
        ],
        "howItWorks": [
            "Each event gets a reminder time.",
            "At that time the message goes out on the user's preferred channel.",
            "If nothing happens, a second reminder runs and the team is told."
        ],
        "youllNeed": "An email or SMS service.",
        "watchOut": "Cancel the reminder once the task is done; otherwise it arrives with no context.",
        "productTags": [
            "Booking & Scheduling",
            "Healthcare",
            "Education"
        ],
        "relatedRecipes": [
            75
        ],
        "promptText": "Build scheduled reminder engine with durable multi-day sleep timers, channel preference fallback, and auto-cancellation."
    },
    {
        "id": 18,
        "title": "API keys for customers",
        "level": 1,
        "category": "ACCOUNTS & ACCESS",
        "audience": [
            "B2B"
        ],
        "difficulty": "Medium",
        "promise": "Give technical customers a key to call your service — with a quota and a way to revoke it.",
        "whatYouCanBuild": [
            "An API-first product",
            "Partner access",
            "A customer connecting their own system"
        ],
        "howItWorks": [
            "The customer creates a key in the panel; it is shown only once.",
            "Every request validates the key and decrements its quota.",
            "Rotation: create a new key, keep both active briefly, then close the old one."
        ],
        "youllNeed": "None.",
        "watchOut": "Never store the raw key — only a hash and a short prefix.",
        "productTags": [
            "SaaS",
            "AI & Automation",
            "Internal Tools"
        ],
        "relatedRecipes": [
            56
        ],
        "promptText": "Build developer API key management with SHA-256 hashed keys, quota metering, usage limits, and zero-downtime rotation."
    },
    {
        "id": 19,
        "title": "One-time codes and magic links",
        "level": 2,
        "category": "ACCOUNTS & ACCESS",
        "audience": [
            "B2C"
        ],
        "difficulty": "Medium",
        "promise": "Let people sign in without a password — just a code or a link.",
        "whatYouCanBuild": [
            "An app with no password form",
            "Fast mobile login",
            "A B2B customer portal"
        ],
        "howItWorks": [
            "The user enters a phone number or email; a six-digit code is created with a two-minute expiry.",
            "The code is stored against that user and sent through the SMS queue.",
            "After verification a session is created and the code is invalidated."
        ],
        "youllNeed": "An SMS or email provider.",
        "watchOut": "Put a per-number send limit in place, or your code becomes a spam tool.",
        "productTags": [
            "SaaS",
            "Fintech & Payments",
            "Booking & Scheduling"
        ],
        "relatedRecipes": [],
        "promptText": "Build passwordless authentication with 6-digit OTP codes, signed magic links, rate limits, and short expiration."
    },
    {
        "id": 20,
        "title": "Team invitations",
        "level": 2,
        "category": "ACCOUNTS & ACCESS",
        "audience": [
            "B2B"
        ],
        "difficulty": "Simple",
        "promise": "Let a manager invite a colleague by email and assign a role.",
        "whatYouCanBuild": [
            "A multi-seat team tool",
            "An agency panel for clients",
            "Invite-only workspaces"
        ],
        "howItWorks": [
            "The manager enters an email; a single-use invite link is created.",
            "The link is valid for a few days and dies once accepted.",
            "Accepting adds the person to the workspace with a role."
        ],
        "youllNeed": "An email service.",
        "watchOut": "Reject duplicate invites, or one person ends up with two accounts.",
        "productTags": [
            "SaaS",
            "Internal Tools"
        ],
        "relatedRecipes": [
            16,
            20
        ],
        "promptText": "Build team invitation workflow with single-use cryptographic tokens, role pre-assignment, and workspace membership sync."
    },
    {
        "id": 21,
        "title": "SMS and OTP delivery",
        "level": 2,
        "category": "COMMUNICATION",
        "audience": [
            "B2C"
        ],
        "difficulty": "Simple",
        "promise": "Send reminder texts, login codes or status updates, with a spend cap.",
        "whatYouCanBuild": [
            "One-time login codes",
            "Appointment reminders",
            "Order status alerts"
        ],
        "howItWorks": [
            "Messages are queued and sent at a controlled rate.",
            "Each number has a limit per time window.",
            "Provider errors keep the message queued for a retry."
        ],
        "youllNeed": "An SMS provider.",
        "watchOut": "SMS costs money; set a daily cap so the bill cannot surprise you.",
        "productTags": [
            "Fintech & Payments",
            "Booking & Scheduling",
            "Logistics"
        ],
        "relatedRecipes": [
            11,
            75
        ],
        "promptText": "Build SMS and OTP dispatch pipeline with queue throttling, carrier retries, and strict daily spend caps."
    },
    {
        "id": 22,
        "title": "Push notifications",
        "level": 2,
        "category": "COMMUNICATION",
        "audience": [
            "B2C"
        ],
        "difficulty": "Medium",
        "promise": "Send push to mobile or web, and respect each user's preferences.",
        "whatYouCanBuild": [
            "New order alerts",
            "A daily task reminder",
            "Breaking news"
        ],
        "howItWorks": [
            "The user registers for notifications.",
            "An event fans out to that user's devices.",
            "If the user turned push off, another channel takes over."
        ],
        "youllNeed": "A push service (FCM or similar).",
        "watchOut": "Duplicate pushes drive users away; use a unique key per event.",
        "productTags": [
            "Social & Community",
            "Media & Content",
            "E-commerce"
        ],
        "relatedRecipes": [
            27,
            75
        ],
        "promptText": "Build multi-device push notification service with device registration tokens, deduplication keys, and fallback channels."
    },
    {
        "id": 23,
        "title": "Digests and newsletters",
        "level": 2,
        "category": "COMMUNICATION",
        "audience": [
            "B2B",
            "B2C"
        ],
        "difficulty": "Simple",
        "promise": "Send a weekly or monthly summary of activity or new content.",
        "whatYouCanBuild": [
            "A weekly newsletter",
            "A team activity digest",
            "A monthly customer report"
        ],
        "howItWorks": [
            "At the scheduled time, the period's content is collected.",
            "A personalised version is built per user.",
            "Sending runs in batches at a controlled rate and the result is recorded."
        ],
        "youllNeed": "An email service.",
        "watchOut": "Send once per period; a re-run must not produce duplicate mail.",
        "productTags": [
            "Media & Content",
            "SaaS",
            "Education"
        ],
        "relatedRecipes": [
            27,
            75
        ],
        "promptText": "Build scheduled user activity digest worker with idempotent period locks, template personalization, and batched email queue."
    },
    {
        "id": 24,
        "title": "Coupons and discounts",
        "level": 2,
        "category": "COMMERCE",
        "audience": [
            "B2C"
        ],
        "difficulty": "Simple",
        "promise": "Create a coupon, cap its usage, and stop abuse.",
        "whatYouCanBuild": [
            "A sales campaign",
            "Referral codes",
            "Loyalty discounts"
        ],
        "howItWorks": [
            "The code is created with a total cap, a per-user cap and an expiry.",
            "On redemption all three conditions are checked.",
            "Usage is counted per user so multiple accounts cannot repeat it."
        ],
        "youllNeed": "None.",
        "watchOut": "Validate the code before taking payment, not after.",
        "productTags": [
            "E-commerce",
            "Marketplace"
        ],
        "relatedRecipes": [
            4
        ],
        "promptText": "Build coupon validation engine with concurrency-safe redemption counters, per-user limits, and checkout lock."
    },
    {
        "id": 25,
        "title": "Inventory across channels",
        "level": 2,
        "category": "COMMERCE",
        "audience": [
            "B2B"
        ],
        "difficulty": "Medium",
        "promise": "Sell on your site and on marketplaces without selling the same item twice.",
        "whatYouCanBuild": [
            "Selling on your site and a marketplace",
            "Multiple branches",
            "Pre-orders with limited stock"
        ],
        "howItWorks": [
            "One central stock number per item.",
            "Every sale decrements that number; at zero, extra sales are rejected.",
            "Sync to other channels happens in the background and failures are reported."
        ],
        "youllNeed": "Channel APIs.",
        "watchOut": "Assume external channels answer late; never lock stock waiting for them.",
        "productTags": [
            "E-commerce",
            "Marketplace",
            "Logistics"
        ],
        "relatedRecipes": [
            5
        ],
        "promptText": "Build multi-channel inventory sync with atomic decrement, out-of-stock rejection, and asynchronous marketplace API fan-out."
    },
    {
        "id": 26,
        "title": "Shipping and tracking",
        "level": 2,
        "category": "COMMERCE",
        "audience": [
            "B2C"
        ],
        "difficulty": "Medium",
        "promise": "Give a tracking number, update the shipment status, and keep the customer informed.",
        "whatYouCanBuild": [
            "A physical store",
            "City courier",
            "International shipping"
        ],
        "howItWorks": [
            "Once packed, a shipment is created and handed to the carrier.",
            "Status updates arrive by carrier webhook and are recorded.",
            "Every status change sends a notification."
        ],
        "youllNeed": "A carrier and an SMS service.",
        "watchOut": "Map carrier statuses to your own; otherwise customers see two vocabularies.",
        "productTags": [
            "E-commerce",
            "Logistics"
        ],
        "relatedRecipes": [
            19,
            21
        ],
        "promptText": "Build carrier shipping and package tracking webhook consumer with status normalization and automated customer SMS alerts."
    },
    {
        "id": 27,
        "title": "Invoices and receipts",
        "level": 2,
        "category": "MONEY",
        "audience": [
            "B2B"
        ],
        "difficulty": "Simple",
        "promise": "Produce a printable invoice with your logo, tax and a unique number for every payment.",
        "whatYouCanBuild": [
            "Formal invoices for business customers",
            "Receipts for users",
            "A monthly finance report"
        ],
        "howItWorks": [
            "After a successful payment the invoice is built from the order data.",
            "Invoice numbers are sequential with no gaps.",
            "The PDF is stored and the link is handed to the customer."
        ],
        "youllNeed": "File storage for archiving.",
        "watchOut": "Do tax maths with decimal arithmetic, not hand rounding.",
        "productTags": [
            "SaaS",
            "E-commerce",
            "Fintech & Payments"
        ],
        "relatedRecipes": [
            6,
            61
        ],
        "promptText": "Build automated PDF invoice generator with strict sequential numbering, tax decimal calculation, and secure archive storage."
    },
    {
        "id": 28,
        "title": "Refunds and disputes",
        "level": 2,
        "category": "MONEY",
        "audience": [
            "B2C"
        ],
        "difficulty": "Medium",
        "promise": "When a customer changes their mind or the bank disputes a charge, have a path and a deadline.",
        "whatYouCanBuild": [
            "Full or partial refunds",
            "Answering a bank chargeback",
            "Cancelling with a refund"
        ],
        "howItWorks": [
            "The refund request is recorded with a reason.",
            "The refund is sent to the provider and the result is stored.",
            "For a dispute, evidence is collected and submitted before the deadline."
        ],
        "youllNeed": "A payment provider.",
        "watchOut": "Record the refund separately from the original charge; never rewrite history.",
        "productTags": [
            "E-commerce",
            "Fintech & Payments",
            "Marketplace"
        ],
        "relatedRecipes": [
            3,
            62
        ],
        "promptText": "Build refund and chargeback dispute workflow with audit history, partial refunds, and evidence deadline tracking."
    },
    {
        "id": 29,
        "title": "Multi-step approvals",
        "level": 2,
        "category": "WORKFLOWS",
        "audience": [
            "Internal"
        ],
        "difficulty": "Medium",
        "promise": "Send a request through several approval levels, and never leave it hanging.",
        "whatYouCanBuild": [
            "Leave requests",
            "Purchase requests",
            "Large discount approvals"
        ],
        "howItWorks": [
            "The request is recorded and sent to the first approver.",
            "If nobody answers for days, a reminder runs and then it escalates.",
            "On final approval the action runs and everything is recorded."
        ],
        "youllNeed": "An email service for notifications.",
        "watchOut": "Assign a delegate up front; leave breaks the chain.",
        "productTags": [
            "Internal Tools",
            "Fintech & Payments",
            "HR & Recruiting"
        ],
        "relatedRecipes": [
            18,
            64,
            68
        ],
        "promptText": "Build hierarchical multi-step approval workflow with inactivity escalation timers, delegate overrides, and audited logs."
    },
    {
        "id": 30,
        "title": "Customer onboarding",
        "level": 2,
        "category": "WORKFLOWS",
        "audience": [
            "B2B"
        ],
        "difficulty": "Medium",
        "promise": "From sign-up to first value, with clear steps and reminders.",
        "whatYouCanBuild": [
            "SaaS welcome flow",
            "Company account setup",
            "Project handover"
        ],
        "howItWorks": [
            "Automated steps run: profile, settings, invite a colleague.",
            "At the right point it waits for an approval or a customer action.",
            "Any overdue step gets a reminder and shows in the report."
        ],
        "youllNeed": "An email service.",
        "watchOut": "Keep onboarding short; a long one kills conversion.",
        "productTags": [
            "SaaS",
            "HR & Recruiting",
            "Education"
        ],
        "relatedRecipes": [
            16,
            20
        ],
        "promptText": "Build customer onboarding orchestration workflow with step completion checks, milestone triggers, and drop-off recovery."
    },
    {
        "id": 31,
        "title": "Comments and reactions",
        "level": 2,
        "category": "CONTENT & FILES",
        "audience": [
            "B2C"
        ],
        "difficulty": "Simple",
        "promise": "Let users comment, like and reply under content.",
        "whatYouCanBuild": [
            "Under a post",
            "Product reviews",
            "Discussion in a course"
        ],
        "howItWorks": [
            "Each comment stores author, text and time.",
            "Replies link to the parent comment.",
            "Like counts are kept separately so concurrency cannot corrupt them."
        ],
        "youllNeed": "None.",
        "watchOut": "Rate-limit posting per user; spam arrives faster than you think.",
        "productTags": [
            "Social & Community",
            "Media & Content",
            "Education"
        ],
        "relatedRecipes": [
            34
        ],
        "promptText": "Build nested comments and atomic reactions system with parent-child tree queries and anti-spam posting limits."
    },
    {
        "id": 32,
        "title": "Moderation queue",
        "level": 2,
        "category": "CONTENT & FILES",
        "audience": [
            "B2B"
        ],
        "difficulty": "Simple",
        "promise": "Review user content before it goes live, or hide it after a report.",
        "whatYouCanBuild": [
            "A marketplace with user listings",
            "A forum",
            "An app with user-generated content"
        ],
        "howItWorks": [
            "New content enters the review queue.",
            "A reviewer approves or rejects it; the reason is recorded.",
            "User reports push published content back into the queue."
        ],
        "youllNeed": "None (optional: automated detection).",
        "watchOut": "Keep the decision and the reviewer; you will need them when someone appeals.",
        "productTags": [
            "Social & Community",
            "Marketplace",
            "Media & Content"
        ],
        "relatedRecipes": [
            22
        ],
        "promptText": "Build content moderation review queue with report thresholds, reviewer audit trails, and automatic content embargo."
    },
    {
        "id": 33,
        "title": "Content publishing workflow",
        "level": 2,
        "category": "WORKFLOWS",
        "audience": [
            "Internal",
            "B2B"
        ],
        "difficulty": "Simple",
        "promise": "Write, review, approve, then publish.",
        "whatYouCanBuild": [
            "A team blog",
            "Course content",
            "Product pages"
        ],
        "howItWorks": [
            "A draft is created and sent to a reviewer.",
            "If rejected, the revised version comes back.",
            "After approval the final version publishes and is recorded."
        ],
        "youllNeed": "A CMS or your own site.",
        "watchOut": "The published version must equal the approved one, or approval means nothing.",
        "productTags": [
            "Media & Content",
            "Education",
            "SaaS"
        ],
        "relatedRecipes": [
            22
        ],
        "promptText": "Build draft-to-publish workflow state machine with editorial reviews, revisions comparison, and scheduled release triggers."
    },
    {
        "id": 34,
        "title": "Image resizing",
        "level": 2,
        "category": "CONTENT & FILES",
        "audience": [
            "B2C"
        ],
        "difficulty": "Medium",
        "promise": "Serve uploaded images at several sizes so pages load fast.",
        "whatYouCanBuild": [
            "A product gallery",
            "User avatars",
            "Social previews"
        ],
        "howItWorks": [
            "The original file is stored.",
            "Optimised versions are generated per size and kept next to it.",
            "The app requests only the size it needs."
        ],
        "youllNeed": "Object storage.",
        "watchOut": "Build variants in the background; upload should not wait on image processing.",
        "productTags": [
            "E-commerce",
            "Media & Content",
            "Social & Community"
        ],
        "relatedRecipes": [
            6
        ],
        "promptText": "Build background image resizing pipeline with thumbnail/retina variant generation, WebP optimization, and CDN upload."
    },
    {
        "id": 35,
        "title": "CSV import",
        "level": 2,
        "category": "INTEGRATIONS",
        "audience": [
            "Internal",
            "B2B"
        ],
        "difficulty": "Medium",
        "promise": "Import a customer's spreadsheet and say exactly which row failed and why.",
        "whatYouCanBuild": [
            "Migration from Excel",
            "Uploading a customer list",
            "Bulk price updates"
        ],
        "howItWorks": [
            "The file is uploaded and processed in a queue.",
            "Each row is validated; good rows are saved, bad rows are quarantined.",
            "The report names each rejected row and the reason."
        ],
        "youllNeed": "File storage.",
        "watchOut": "Do not process a big file inside a request; it will time out.",
        "productTags": [
            "Internal Tools",
            "SaaS",
            "E-commerce"
        ],
        "relatedRecipes": [
            28,
            52
        ],
        "promptText": "Build asynchronous CSV bulk import queue with row-by-row validation, error quarantine, and downloadable failure report."
    },
    {
        "id": 36,
        "title": "Feature flags",
        "level": 2,
        "category": "OPERATIONS",
        "audience": [
            "Internal"
        ],
        "difficulty": "Simple",
        "promise": "Turn a new feature on for a percentage of users without redeploying.",
        "whatYouCanBuild": [
            "Gradual rollout",
            "A/B tests",
            "Kill switch during an incident"
        ],
        "howItWorks": [
            "Each flag has a state per tenant or user.",
            "The app checks the flag before showing the feature.",
            "Changing a flag takes effect immediately."
        ],
        "youllNeed": "None.",
        "watchOut": "Delete flags once they are settled, or nobody will remember why they exist.",
        "productTags": [
            "SaaS",
            "Internal Tools"
        ],
        "relatedRecipes": [
            15
        ],
        "promptText": "Build dynamic feature flag engine with user percentage rollouts, tenant overrides, and instant emergency kill switches."
    },
    {
        "id": 37,
        "title": "Scheduled reports",
        "level": 2,
        "category": "OPERATIONS",
        "audience": [
            "Internal",
            "B2B"
        ],
        "difficulty": "Simple",
        "promise": "Have the report ready every night or week, without slowing the app.",
        "whatYouCanBuild": [
            "Daily sales report",
            "Weekly manager digest",
            "Financial report"
        ],
        "howItWorks": [
            "The report is built in the background.",
            "The result is stored and a link is sent.",
            "If data is incomplete, the report is marked with a warning."
        ],
        "youllNeed": "An email service, file storage.",
        "watchOut": "Do not build a heavy report inside a user request; the page must open instantly.",
        "productTags": [
            "SaaS",
            "Internal Tools",
            "Fintech & Payments"
        ],
        "relatedRecipes": [
            29,
            74
        ],
        "promptText": "Build background cron reporting engine with aggregation queries, PDF export, storage upload, and scheduled executive email delivery."
    },
    {
        "id": 38,
        "title": "Usage metering",
        "level": 2,
        "category": "OPERATIONS",
        "audience": [
            "B2B"
        ],
        "difficulty": "Medium",
        "promise": "Know how much each customer uses, as the base for billing and limits.",
        "whatYouCanBuild": [
            "Plan quotas",
            "Customer usage reports",
            "Near-limit warnings"
        ],
        "howItWorks": [
            "Each usage event is recorded with a unique id.",
            "Usage is summed for the current window.",
            "Crossing the cap triggers a warning or a limit."
        ],
        "youllNeed": "None.",
        "watchOut": "Drop duplicate events; real usage must not be counted twice.",
        "productTags": [
            "SaaS",
            "AI & Automation"
        ],
        "relatedRecipes": [
            17,
            48
        ],
        "promptText": "Build high-throughput usage metering engine with deduplicated event ingestion, window aggregations, and near-quota webhook alerts."
    },
    {
        "id": 39,
        "title": "Marketplace payouts",
        "level": 3,
        "category": "MONEY",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Split revenue between sellers and pay each one at the end of the period.",
        "whatYouCanBuild": [
            "A multi-vendor marketplace",
            "Revenue share between partners",
            "Paying content creators"
        ],
        "howItWorks": [
            "Unsettled orders for the period are collected.",
            "Commission and tax are deducted and each seller's balance is computed.",
            "Payouts run in batches and every result is recorded."
        ],
        "youllNeed": "A payment provider or bank for transfers.",
        "watchOut": "Freeze the period before paying so amounts cannot shift mid-run.",
        "productTags": [
            "Marketplace",
            "Fintech & Payments"
        ],
        "relatedRecipes": [
            9,
            60
        ],
        "promptText": "Build automated marketplace payout batch engine with commission splits, period snapshot freezes, and bank transfer reconciliation."
    },
    {
        "id": 40,
        "title": "Wallet and ledger",
        "level": 3,
        "category": "MONEY",
        "audience": [
            "B2C"
        ],
        "difficulty": "Advanced",
        "promise": "Hold a balance per user, let them top up and withdraw, and always know where the money went.",
        "whatYouCanBuild": [
            "An in-app wallet",
            "Gift credit",
            "A settlement ledger"
        ],
        "howItWorks": [
            "Every top-up or withdrawal writes a two-sided entry: from one place, to another.",
            "Each user's balance is kept separately so concurrency cannot corrupt it.",
            "A daily report compares debits and credits."
        ],
        "youllNeed": "A payment provider for top-ups.",
        "watchOut": "Never edit a balance directly; always write an entry so it stays traceable.",
        "productTags": [
            "Fintech & Payments",
            "Marketplace"
        ],
        "relatedRecipes": [
            7,
            59,
            63
        ],
        "promptText": "Build double-entry ledger and user wallet system with concurrency locks, immutable transaction journal, and reconciliation checks."
    },
    {
        "id": 41,
        "title": "Usage-based billing",
        "level": 3,
        "category": "MONEY",
        "audience": [
            "B2B"
        ],
        "difficulty": "Medium",
        "promise": "Meter every API call, message or gigabyte, then bill at the end of the month.",
        "whatYouCanBuild": [
            "An API with metered pricing",
            "An AI tool billed by tokens",
            "A small cloud service"
        ],
        "howItWorks": [
            "Each usage event is recorded with a unique id.",
            "At period end, usage is summed per customer.",
            "An invoice is produced, and an unpaid one starts the dunning path."
        ],
        "youllNeed": "A payment provider.",
        "watchOut": "Drop duplicate events, or the bill inflates and trust goes with it.",
        "productTags": [
            "SaaS",
            "AI & Automation",
            "Fintech & Payments"
        ],
        "relatedRecipes": [
            17,
            12
        ],
        "promptText": "Build usage-based metered billing engine with event deduplication, tiered pricing tiers, monthly invoice generation, and dunning."
    },
    {
        "id": 42,
        "title": "Identity checks (KYC)",
        "level": 3,
        "category": "WORKFLOWS",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Collect customer documents, review them, and keep access limited until approved.",
        "whatYouCanBuild": [
            "A financial service",
            "Car or property rental",
            "Selling on credit"
        ],
        "howItWorks": [
            "The customer uploads documents.",
            "The case stays open for a reviewer and expires automatically after 48 hours.",
            "Approval unlocks full access; rejection states the reason."
        ],
        "youllNeed": "An identity verification service, secure document storage.",
        "watchOut": "Documents are sensitive; log and limit every access.",
        "productTags": [
            "Fintech & Payments",
            "Marketplace",
            "Travel"
        ],
        "relatedRecipes": [
            8,
            53
        ],
        "promptText": "Build identity verification (KYC) onboarding pipeline with encrypted document storage, reviewer approval, and 48h case expiration."
    },
    {
        "id": 43,
        "title": "Contracts and e-signature",
        "level": 3,
        "category": "WORKFLOWS",
        "audience": [
            "B2B"
        ],
        "difficulty": "Medium",
        "promise": "Generate a contract, send it out, collect signatures and archive it.",
        "whatYouCanBuild": [
            "Customer contracts",
            "Partnership agreements",
            "Consent forms"
        ],
        "howItWorks": [
            "The contract is built from customer data.",
            "Each party receives a signing link.",
            "The signed version is stored and sent to both sides."
        ],
        "youllNeed": "An e-signature service, file storage.",
        "watchOut": "Store the final version with a hash so it can be proven later.",
        "productTags": [
            "HR & Recruiting",
            "Internal Tools",
            "SaaS"
        ],
        "relatedRecipes": [
            19
        ],
        "promptText": "Build contract signing workflow with template population, external signer links, SHA-256 integrity hash, and PDF archive."
    },
    {
        "id": 44,
        "title": "AI chatbot with memory",
        "level": 3,
        "category": "AI & AUTOMATION",
        "audience": [
            "B2B",
            "B2C"
        ],
        "difficulty": "Medium",
        "promise": "A chatbot that remembers the conversation and stays on topic.",
        "whatYouCanBuild": [
            "Automated support",
            "An internal assistant",
            "A product advisor"
        ],
        "howItWorks": [
            "Each conversation keeps its own history, with messages stored in order.",
            "The model answers with that conversation's context.",
            "If a reply is slow, it is generated in the background and delivered later."
        ],
        "youllNeed": "A model API key.",
        "watchOut": "Summarise old history so token costs do not creep up.",
        "productTags": [
            "AI & Automation",
            "SaaS",
            "E-commerce"
        ],
        "relatedRecipes": [
            34
        ],
        "promptText": "Build AI chatbot backend with durable conversation history, sliding context window summarization, and streaming response delivery."
    },
    {
        "id": 45,
        "title": "AI agent with tools",
        "level": 3,
        "category": "AI & AUTOMATION",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "An agent that does more than talk: it can search, create orders and send email.",
        "whatYouCanBuild": [
            "An operations assistant",
            "A sales agent",
            "Support automation"
        ],
        "howItWorks": [
            "Every agent action (search, create, send) is a separate, trackable step.",
            "If it crashes mid-run it resumes from that step without repeating earlier ones.",
            "Sensitive actions require a human approval first."
        ],
        "youllNeed": "A model key and the APIs the agent calls.",
        "watchOut": "Set a spend cap; an uncapped agent writes cheques you did not sign.",
        "productTags": [
            "AI & Automation",
            "SaaS"
        ],
        "relatedRecipes": [
            31,
            32,
            69
        ],
        "promptText": "Build autonomous AI agent tool execution workflow with checkpoint recovery, function calling audit logs, and human-in-the-loop approvals."
    },
    {
        "id": 46,
        "title": "Answers from your own docs (RAG)",
        "level": 3,
        "category": "AI & AUTOMATION",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "A chatbot that answers from your policies and documents, not from guesswork.",
        "whatYouCanBuild": [
            "An internal policy assistant",
            "Product support",
            "Semantic search over an archive"
        ],
        "howItWorks": [
            "Documents are chunked and sent to a vector index.",
            "For each question the closest chunks are retrieved.",
            "The answer is generated with citations to the source."
        ],
        "youllNeed": "A vector service and a model.",
        "watchOut": "Without sources the answer is not trustworthy; keep the citations.",
        "productTags": [
            "AI & Automation",
            "Education",
            "SaaS"
        ],
        "relatedRecipes": [
            73
        ],
        "promptText": "Build document RAG pipeline with text chunking, vector embedding indexing, hybrid search retrieval, and grounded citation generation."
    },
    {
        "id": 47,
        "title": "Content generation pipeline",
        "level": 3,
        "category": "AI & AUTOMATION",
        "audience": [
            "B2B"
        ],
        "difficulty": "Medium",
        "promise": "Generate descriptions and tags for hundreds of items without losing control of cost.",
        "whatYouCanBuild": [
            "Product descriptions",
            "Article summaries",
            "Auto-tagging"
        ],
        "howItWorks": [
            "Items are sent to the model in batches.",
            "Output is validated and stored with each item.",
            "Failures retry, then land in the dead-letter queue."
        ],
        "youllNeed": "A model API key.",
        "watchOut": "Cap daily spend; bulk generation gets expensive quietly.",
        "productTags": [
            "AI & Automation",
            "Media & Content",
            "E-commerce"
        ],
        "relatedRecipes": [
            33,
            72
        ],
        "promptText": "Build batch AI content generation pipeline with JSON schema validation, daily spend enforcement, and dead-letter queue."
    },
    {
        "id": 48,
        "title": "Human review for AI output",
        "level": 3,
        "category": "AI & AUTOMATION",
        "audience": [
            "B2B"
        ],
        "difficulty": "Medium",
        "promise": "Before model output is published or executed, a person looks at it.",
        "whatYouCanBuild": [
            "Publishing generated content",
            "An agent taking a financial action",
            "Replying to customers"
        ],
        "howItWorks": [
            "Model output is sent to a reviewer.",
            "The reviewer approves, edits or rejects.",
            "The final version is stored with the reviewer's name."
        ],
        "youllNeed": "None.",
        "watchOut": "Put a timeout on approval; waiting forever means the work is stuck.",
        "productTags": [
            "AI & Automation",
            "Media & Content"
        ],
        "relatedRecipes": [
            32,
            70
        ],
        "promptText": "Build human-in-the-loop review queue for AI generations with diff editing, approval timeout policies, and audit logs."
    },
    {
        "id": 49,
        "title": "AI usage billing",
        "level": 3,
        "category": "AI & AUTOMATION",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Meter what each customer spends on the model and bill it in their plan.",
        "whatYouCanBuild": [
            "A SaaS with AI credits",
            "Token-based plans",
            "Daily usage limits"
        ],
        "howItWorks": [
            "Every call records tokens and cost.",
            "Usage is summed per customer per period.",
            "The plan cap is checked and, when exceeded, a warning or limit applies."
        ],
        "youllNeed": "A model key, a payment provider.",
        "watchOut": "Model prices change; compute cost with the current rate, not a hard-coded one.",
        "productTags": [
            "AI & Automation",
            "SaaS"
        ],
        "relatedRecipes": [
            17,
            69
        ],
        "promptText": "Build AI token credit metering and plan limit enforcement backend with dynamic model price lookup and credit top-up."
    },
    {
        "id": 50,
        "title": "CRM / ERP sync",
        "level": 3,
        "category": "INTEGRATIONS",
        "audience": [
            "B2B",
            "Internal"
        ],
        "difficulty": "Advanced",
        "promise": "Move data between your system and a CRM or ERP without bad overwrites.",
        "whatYouCanBuild": [
            "Sales with a CRM",
            "Finance with an ERP",
            "Support with a helpdesk"
        ],
        "howItWorks": [
            "Each change is recorded with version and time.",
            "If both sides changed at once, the winning rule is explicit.",
            "Failures are kept for replay instead of being lost."
        ],
        "youllNeed": "The target system's API.",
        "watchOut": "Without a conflict rule, sync quietly corrupts data.",
        "productTags": [
            "Internal Tools",
            "SaaS",
            "E-commerce"
        ],
        "relatedRecipes": [
            24,
            51
        ],
        "promptText": "Build bidirectional CRM/ERP synchronization worker with version timestamps, deterministic conflict resolution, and dead-letter replay."
    },
    {
        "id": 51,
        "title": "Calendar sync",
        "level": 3,
        "category": "INTEGRATIONS",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Keep bookings in sync between your app and the user's calendar.",
        "whatYouCanBuild": [
            "Meeting booking",
            "Appointments",
            "A team calendar"
        ],
        "howItWorks": [
            "The event is created in your system.",
            "Changes from either side arrive by webhook.",
            "Conflicts are resolved by the latest change time."
        ],
        "youllNeed": "A calendar API (Google or Outlook).",
        "watchOut": "Store the external event id; without it you will create duplicates.",
        "productTags": [
            "Booking & Scheduling",
            "SaaS",
            "Healthcare"
        ],
        "relatedRecipes": [
            78
        ],
        "promptText": "Build two-way Google and Outlook calendar sync with webhook delta updates, external event id tracking, and conflict reconciliation."
    },
    {
        "id": 52,
        "title": "Live activity feed",
        "level": 3,
        "category": "REALTIME & DEVICES",
        "audience": [
            "B2C"
        ],
        "difficulty": "Medium",
        "promise": "Users see what just happened: a new order, a new message, a status change.",
        "whatYouCanBuild": [
            "A team dashboard",
            "In-app notifications",
            "A live system log"
        ],
        "howItWorks": [
            "Every event is written to the feed.",
            "The app reads the feed every few seconds.",
            "Older events are pruned over time."
        ],
        "youllNeed": "WebSocket or an external service for true push.",
        "watchOut": "There is no native push to clients today; use short polling for the feed.",
        "productTags": [
            "Social & Community",
            "SaaS",
            "Games"
        ],
        "relatedRecipes": [
            34,
            38
        ],
        "promptText": "Build high-speed live activity feed with ring-buffer storage, cursor pagination, and efficient client short-polling."
    },
    {
        "id": 53,
        "title": "IoT devices",
        "level": 3,
        "category": "REALTIME & DEVICES",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Keep each device's state, send commands, and notice when it goes silent.",
        "whatYouCanBuild": [
            "Lighting control",
            "Equipment monitoring",
            "A tracker"
        ],
        "howItWorks": [
            "Each device has a status record: last state and last contact.",
            "A command waits in the device's queue until it is online.",
            "A missed heartbeat marks the device offline and raises an alert."
        ],
        "youllNeed": "An MQTT broker for device connectivity, time-series storage.",
        "watchOut": "High-volume telemetry is not this product's job today; commands and state are.",
        "productTags": [
            "IoT & Hardware",
            "Logistics"
        ],
        "relatedRecipes": [
            37
        ],
        "promptText": "Build IoT device state management with MQTT command queueing, heartbeat timeout watchdog, and offline status alerts."
    },
    {
        "id": 54,
        "title": "Game rooms",
        "level": 3,
        "category": "REALTIME & DEVICES",
        "audience": [
            "B2C"
        ],
        "difficulty": "Advanced",
        "promise": "Several players in one room, with turns and scores that stay exact.",
        "whatYouCanBuild": [
            "A turn-based game",
            "An online contest",
            "A chat room"
        ],
        "howItWorks": [
            "Each room has its own state: players, turn, score.",
            "Moves are processed one at a time so turns cannot break.",
            "When the game ends the result is recorded on the player."
        ],
        "youllNeed": "WebSocket or an external service for real-time play.",
        "watchOut": "Turn-based play works with polling today; fast real-time does not.",
        "productTags": [
            "Games"
        ],
        "relatedRecipes": [
            38
        ],
        "promptText": "Build turn-based multiplayer game room with actor state isolation, strict serialized turn processing, and game score persistence."
    },
    {
        "id": 55,
        "title": "Presence and typing",
        "level": 3,
        "category": "REALTIME & DEVICES",
        "audience": [
            "B2C"
        ],
        "difficulty": "Medium",
        "promise": "Show who is online and who is typing.",
        "whatYouCanBuild": [
            "Team chat",
            "Live support",
            "A shared workspace"
        ],
        "howItWorks": [
            "Each user has an online state and a last-activity time.",
            "The typing state is temporary and clears itself.",
            "The app reads presence with short polling."
        ],
        "youllNeed": "WebSocket or an external service for true push.",
        "watchOut": "Do not keep presence forever; expire it after a few seconds.",
        "productTags": [
            "Social & Community",
            "Games",
            "SaaS"
        ],
        "relatedRecipes": [
            38,
            76
        ],
        "promptText": "Build presence and typing status tracker with heartbeat TTL keys, automatic state expiration, and compact polling endpoint."
    },
    {
        "id": 56,
        "title": "Events that never get lost",
        "level": 3,
        "category": "OUTBOX PATTERN",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "If the service dies mid-work, events are neither lost nor sent twice.",
        "whatYouCanBuild": [
            "Order notice to warehouse and finance",
            "Events to a customer system"
        ],
        "howItWorks": [
            "The event is stored at the same moment the change is recorded.",
            "A separate worker publishes it.",
            "If publishing fails it retries, but the event is not re-created."
        ],
        "youllNeed": "None.",
        "watchOut": "Put a unique key on every event, or the customer gets two messages.",
        "productTags": [
            "Fintech & Payments",
            "E-commerce",
            "SaaS"
        ],
        "relatedRecipes": [],
        "promptText": "Build transactional transactional outbox worker with atomic database commit, durable publishing queue, and at-least-once delivery."
    },
    {
        "id": 57,
        "title": "Safe retries",
        "level": 3,
        "category": "IDEMPOTENCY KEYS",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "If someone double-clicks or the network drops, money is not charged twice.",
        "whatYouCanBuild": [
            "Payments",
            "Order creation",
            "User invitations"
        ],
        "howItWorks": [
            "Every request carries a unique key from the app.",
            "If the same key arrives again, the previous response is returned.",
            "The result of each key is stored for later."
        ],
        "youllNeed": "None.",
        "watchOut": "Derive the key yourself (for example, the order id), not randomly.",
        "productTags": [
            "Fintech & Payments",
            "E-commerce"
        ],
        "relatedRecipes": [],
        "promptText": "Build API idempotency layer with request hashing, in-flight mutex locks, and cached response replay."
    },
    {
        "id": 58,
        "title": "Trip a failing dependency",
        "level": 3,
        "category": "CIRCUIT BREAKER",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "When an external service is broken, requests fail fast so your app stays quick.",
        "whatYouCanBuild": [
            "Payment gateway",
            "SMS provider",
            "Partner API"
        ],
        "howItWorks": [
            "Errors from one service are counted.",
            "Past a threshold the path opens and requests fail immediately.",
            "After a while a probe request goes out; if it succeeds, the path closes again."
        ],
        "youllNeed": "None.",
        "watchOut": "Without this, one slow dependency makes your whole app slow.",
        "productTags": [
            "SaaS",
            "Fintech & Payments",
            "Logistics"
        ],
        "relatedRecipes": [],
        "promptText": "Build circuit breaker pattern for external third-party APIs with error rate threshold, half-open health probes, and fast fallback."
    },
    {
        "id": 59,
        "title": "Dead-letter queue",
        "level": 3,
        "category": "FAILED JOBS, KEPT",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Jobs that failed repeatedly are collected in one place for someone to fix.",
        "whatYouCanBuild": [
            "Failed emails",
            "Broken payments",
            "Failed sync jobs"
        ],
        "howItWorks": [
            "Each job retries a few times.",
            "After the last attempt it moves to a review queue instead of being dropped.",
            "Once the cause is fixed, the team can replay it."
        ],
        "youllNeed": "None.",
        "watchOut": "Without this queue, failures disappear silently and nobody knows.",
        "productTags": [
            "SaaS",
            "E-commerce",
            "AI & Automation"
        ],
        "relatedRecipes": [],
        "promptText": "Build dead-letter queue (DLQ) with error stack capture, replay console API, and automated incident alert webhooks."
    },
    {
        "id": 60,
        "title": "Rate limits at several levels",
        "level": 3,
        "category": "MULTI-LEVEL RATE LIMITING",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Big customers, individual users and IPs each get a cap — without one eating another's share.",
        "whatYouCanBuild": [
            "Plan quota",
            "Per-user limit",
            "Login protection"
        ],
        "howItWorks": [
            "A separate counter is kept for each level.",
            "Every request passes through all levels.",
            "The strictest limit wins."
        ],
        "youllNeed": "None.",
        "watchOut": "Do not rely on a single global cap; one heavy customer cuts everyone off.",
        "productTags": [
            "SaaS",
            "Fintech & Payments"
        ],
        "relatedRecipes": [],
        "promptText": "Build multi-tier sliding window rate limiter enforcing tenant quotas, per-user limits, and IP anti-abuse rules with 429 Retry-After."
    },
    {
        "id": 61,
        "title": "Chain of compensation",
        "level": 4,
        "category": "SAGA AND COMPENSATION",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "In a multi-step process, if step three fails, steps one and two are undone.",
        "whatYouCanBuild": [
            "Travel booking",
            "Order with stock reservation",
            "Transfers between accounts"
        ],
        "howItWorks": [
            "Each step has a defined undo (for example, release the reservation).",
            "On failure the undos run in reverse order.",
            "Each undo is retried if it fails."
        ],
        "youllNeed": "None.",
        "watchOut": "Design the undo first; adding it later is close to a rewrite.",
        "productTags": [
            "Travel",
            "Marketplace",
            "E-commerce"
        ],
        "relatedRecipes": [],
        "promptText": "Build distributed Saga workflow with reverse-order compensation step execution, durable rollback logging, and retry persistence."
    },
    {
        "id": 62,
        "title": "Lock on each entity",
        "level": 4,
        "category": "PER-ENTITY LOCK",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Two simultaneous requests on one order or cart do not corrupt each other.",
        "whatYouCanBuild": [
            "Shopping cart",
            "Stock",
            "Wallet"
        ],
        "howItWorks": [
            "Each entity processes its messages one at a time.",
            "The next one starts only when the previous finishes.",
            "If the server dies, the lock releases itself."
        ],
        "youllNeed": "None.",
        "watchOut": "Manual database locks get stuck after a crash; this pattern does not.",
        "productTags": [
            "E-commerce",
            "Fintech & Payments",
            "Games"
        ],
        "relatedRecipes": [],
        "promptText": "Build actor-based per-entity single-thread message processing with automatic lock lease renewal and crash-safe queue draining."
    },
    {
        "id": 63,
        "title": "Fan out and join",
        "level": 4,
        "category": "FAN-OUT AND JOIN",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "One event runs for hundreds of customers or tenants, and all results are joined.",
        "whatYouCanBuild": [
            "Bulk notifications",
            "Monthly computation for every tenant",
            "Simultaneous uploads"
        ],
        "howItWorks": [
            "The work is split into as many jobs as needed.",
            "They run in parallel.",
            "At the end results are joined; one failure does not stop the rest."
        ],
        "youllNeed": "None.",
        "watchOut": "For very large numbers, batch it; a thousand parallel jobs is its own problem.",
        "productTags": [
            "SaaS",
            "E-commerce"
        ],
        "relatedRecipes": [],
        "promptText": "Build fan-out and join parallel job coordinator with chunked batch execution, partial failure tolerance, and unified result aggregation."
    },
    {
        "id": 64,
        "title": "Backpressure",
        "level": 4,
        "category": "BACKPRESSURE",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "When load spikes, the app slows down gracefully instead of falling over.",
        "whatYouCanBuild": [
            "Sales campaign",
            "API ingress",
            "Simultaneous uploads"
        ],
        "howItWorks": [
            "Each queue gets a cap and a rate.",
            "When full, it answers 429 with a retry time.",
            "The queue cannot grow without bound."
        ],
        "youllNeed": "None.",
        "watchOut": "Without a cap, the queue grows until it collapses all at once.",
        "productTags": [
            "SaaS",
            "AI & Automation"
        ],
        "relatedRecipes": [],
        "promptText": "Build backpressure queue controller with fixed capacity buffers, worker consumption throttling, and graceful HTTP 429 shedding."
    },
    {
        "id": 65,
        "title": "Retry budget",
        "level": 4,
        "category": "RETRY BUDGET",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Retries do not make an outage worse.",
        "whatYouCanBuild": [
            "Flaky external service",
            "SMS queue"
        ],
        "howItWorks": [
            "Total attempts per window are counted.",
            "When the budget is gone, fail fast and take the fallback path.",
            "After recovery the budget refills automatically."
        ],
        "youllNeed": "None.",
        "watchOut": "Unlimited retries are what turns a wobble into an outage.",
        "productTags": [
            "SaaS",
            "Logistics"
        ],
        "relatedRecipes": [],
        "promptText": "Build retry budget governor limiting total background retry percentage, preventing retry storms during upstream service degradation."
    },
    {
        "id": 66,
        "title": "Separate reads from writes",
        "level": 4,
        "category": "CQRS PROJECTION",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Heavy reads do not slow down checkout or payment.",
        "whatYouCanBuild": [
            "Reporting dashboard",
            "Order list",
            "Activity feed"
        ],
        "howItWorks": [
            "Writes go to the source.",
            "A separate read model is updated from events.",
            "Screens read from that model."
        ],
        "youllNeed": "None.",
        "watchOut": "The read model must be rebuildable; otherwise one bug corrupts it forever.",
        "productTags": [
            "SaaS",
            "Fintech & Payments",
            "Media & Content"
        ],
        "relatedRecipes": [],
        "promptText": "Build CQRS read model projection service with asynchronous domain event updates and complete rebuild from source events."
    },
    {
        "id": 67,
        "title": "Full change history",
        "level": 4,
        "category": "EVENT SOURCING",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Know what a record looked like at any moment, and who changed what.",
        "whatYouCanBuild": [
            "Ledger",
            "Order status",
            "Price history"
        ],
        "howItWorks": [
            "Every change is stored as an event, not an overwrite.",
            "The current state is built from those events.",
            "A summary snapshot is saved periodically for speed."
        ],
        "youllNeed": "None.",
        "watchOut": "For high volume, manage event size or reads get slow.",
        "productTags": [
            "Fintech & Payments",
            "SaaS",
            "Healthcare"
        ],
        "relatedRecipes": [],
        "promptText": "Build event-sourced entity state engine with append-only event log, periodic state snapshots, and point-in-time state replay."
    },
    {
        "id": 68,
        "title": "Nightly reconciliation",
        "level": 4,
        "category": "RECONCILIATION",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Every night, check that your data and the external system agree.",
        "whatYouCanBuild": [
            "Reconcile with the gateway",
            "Reconcile with the warehouse",
            "Reconcile with the bank"
        ],
        "howItWorks": [
            "Both sides are read and compared.",
            "Mismatches are listed.",
            "Each mismatch creates a follow-up task."
        ],
        "youllNeed": "Access to the external report.",
        "watchOut": "A report without follow-up is just a PDF nobody reads.",
        "productTags": [
            "Fintech & Payments",
            "E-commerce",
            "Logistics"
        ],
        "relatedRecipes": [],
        "promptText": "Build automated nightly financial reconciliation worker comparing internal orders against gateway reports with discrepancy issue creation."
    },
    {
        "id": 69,
        "title": "Backfill without downtime",
        "level": 4,
        "category": "BACKFILL",
        "audience": [
            "Internal",
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Process old data without stopping the service, and resume where you left off.",
        "whatYouCanBuild": [
            "Add a field to millions of rows",
            "Rebuild an index",
            "Data migration"
        ],
        "howItWorks": [
            "Work is split into small batches.",
            "Progress is stored per batch.",
            "After a crash it continues from the last successful batch."
        ],
        "youllNeed": "None.",
        "watchOut": "Without a checkpoint, every crash means starting from zero.",
        "productTags": [
            "SaaS",
            "Internal Tools"
        ],
        "relatedRecipes": [],
        "promptText": "Build zero-downtime cursor-based backfill worker with persistent batch checkpoints, throttle controls, and automatic resume."
    },
    {
        "id": 70,
        "title": "Retention and erasure",
        "level": 4,
        "category": "RETENTION AND ERASURE",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Temporary data expires on its own, and a user's deletion request is fully executed.",
        "whatYouCanBuild": [
            "Delete an account",
            "Purge old logs",
            "Data regulation compliance"
        ],
        "howItWorks": [
            "Transient data gets an expiry date.",
            "A deletion request clears every reference.",
            "A report records what was removed."
        ],
        "youllNeed": "None.",
        "watchOut": "A partial delete is worse than none; list every source.",
        "productTags": [
            "SaaS",
            "Healthcare",
            "Fintech & Payments"
        ],
        "relatedRecipes": [],
        "promptText": "Build GDPR/privacy data retention and cascading erasure worker with TTL purging, multi-table deletion saga, and audit proof."
    },
    {
        "id": 71,
        "title": "Record-level access",
        "level": 4,
        "category": "ATTRIBUTE-BASED ACCESS",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Access depends on ownership and state, not just role.",
        "whatYouCanBuild": [
            "A customer sees only their order",
            "A specialist sees only their region"
        ],
        "howItWorks": [
            "Ownership and tenant are checked on every request.",
            "The rule lives in one place, not in every screen.",
            "Changing the rule takes effect without a redeploy."
        ],
        "youllNeed": "None.",
        "watchOut": "Hiding a button is not enough; the check must be server-side.",
        "productTags": [
            "SaaS",
            "Healthcare",
            "Internal Tools"
        ],
        "relatedRecipes": [],
        "promptText": "Build attribute-based access control (ABAC) layer with dynamic tenant ownership enforcement and declarative policy evaluations."
    },
    {
        "id": 72,
        "title": "Webhook signing",
        "level": 4,
        "category": "WEBHOOK SIGNING",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Make sure an incoming event really came from that service, and is not a replay.",
        "whatYouCanBuild": [
            "Payment webhook",
            "Signature service event",
            "Carrier update"
        ],
        "howItWorks": [
            "Every message carries a signature.",
            "Signature and timestamp are verified.",
            "Duplicate messages are rejected by id."
        ],
        "youllNeed": "None.",
        "watchOut": "The webhook URL is public; without a signature anyone can change state.",
        "productTags": [
            "Fintech & Payments",
            "SaaS"
        ],
        "relatedRecipes": [],
        "promptText": "Build cryptographic webhook verification middleware with HMAC-SHA256 signature validation, timestamp replay window, and nonce cache."
    },
    {
        "id": 73,
        "title": "Multi-currency ledger",
        "level": 4,
        "category": "MULTI-CURRENCY LEDGER",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Work in several currencies and always know the rate each amount was booked at.",
        "whatYouCanBuild": [
            "International sales",
            "Multi-currency wallet",
            "Settling with a foreign partner"
        ],
        "howItWorks": [
            "Each entry stores the original currency and the rate at that moment.",
            "Each currency has its own balance.",
            "The report converts totals to a base currency."
        ],
        "youllNeed": "An FX rate source.",
        "watchOut": "Store the rate on the entry, not in settings, or history changes.",
        "productTags": [
            "Fintech & Payments",
            "Travel",
            "Marketplace"
        ],
        "relatedRecipes": [],
        "promptText": "Build multi-currency ledger with transaction-time exchange rate capture, isolated currency balances, and consolidated base reporting."
    },
    {
        "id": 74,
        "title": "Escrow",
        "level": 4,
        "category": "ESCROW",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Hold the money until delivery, or until the dispute window closes.",
        "whatYouCanBuild": [
            "Marketplace",
            "Freelance projects",
            "Bookings with a deposit"
        ],
        "howItWorks": [
            "Payment is captured and recorded as pending.",
            "On delivery or window expiry it is released.",
            "On dispute it stays held until a decision."
        ],
        "youllNeed": "A payment provider.",
        "watchOut": "Set the dispute window up front; changing it later feels unfair.",
        "productTags": [
            "Marketplace",
            "Travel",
            "Fintech & Payments"
        ],
        "relatedRecipes": [],
        "promptText": "Build escrow payment state machine with conditional holding, timed release windows, dispute freeze, and multi-party payout."
    },
    {
        "id": 75,
        "title": "Separate maker and checker",
        "level": 4,
        "category": "MAKER-CHECKER",
        "audience": [
            "B2B",
            "Internal"
        ],
        "difficulty": "Advanced",
        "promise": "The person who creates a request cannot approve it.",
        "whatYouCanBuild": [
            "Payout to a seller",
            "Changing access level",
            "Correcting stock"
        ],
        "howItWorks": [
            "The request is recorded with its creator.",
            "Only a different user can approve it.",
            "Both actions are recorded."
        ],
        "youllNeed": "None.",
        "watchOut": "This rule must live on the server; the UI can be bypassed.",
        "productTags": [
            "Fintech & Payments",
            "Internal Tools",
            "HR & Recruiting"
        ],
        "relatedRecipes": [],
        "promptText": "Build maker-checker dual authorization pattern requiring two distinct verified users for high-risk financial and administrative actions."
    },
    {
        "id": 76,
        "title": "Shift handover",
        "level": 4,
        "category": "SHIFT HANDOVER",
        "audience": [
            "Internal"
        ],
        "difficulty": "Advanced",
        "promise": "The next shift knows which cases are open and urgent, without reading ten tabs.",
        "whatYouCanBuild": [
            "24/7 support",
            "Operations centre",
            "Night coverage"
        ],
        "howItWorks": [
            "At shift end, open cases are collected.",
            "Each gets a summary and a next action.",
            "The handover is recorded and the next shift is notified."
        ],
        "youllNeed": "None.",
        "watchOut": "Build the summary from case data, not from memory.",
        "productTags": [
            "Internal Tools",
            "Healthcare",
            "Logistics"
        ],
        "relatedRecipes": [],
        "promptText": "Build operational shift handover workflow with automatic open-ticket aggregation, pending action digest, and sign-off notification."
    },
    {
        "id": 77,
        "title": "Prompt versioning and evals",
        "level": 4,
        "category": "PROMPT VERSIONING AND EVALS",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "Know which prompt version performs better before everything drifts.",
        "whatYouCanBuild": [
            "Support chatbot",
            "Content generation",
            "Internal assistant"
        ],
        "howItWorks": [
            "Each prompt version is registered with an id.",
            "Both versions run against a fixed test set.",
            "Results are compared and the better one is chosen."
        ],
        "youllNeed": "A model key.",
        "watchOut": "Without a fixed test set, comparison is a feeling, not data.",
        "productTags": [
            "AI & Automation"
        ],
        "relatedRecipes": [],
        "promptText": "Build prompt version registry with automated evaluation runner against golden dataset, output score diffing, and canary release."
    },
    {
        "id": 78,
        "title": "Recovery after an outage",
        "level": 4,
        "category": "RECOVERY AFTER AN OUTAGE",
        "audience": [
            "B2B"
        ],
        "difficulty": "Advanced",
        "promise": "If an external service died mid-work, know where you stopped and do not repeat it.",
        "whatYouCanBuild": [
            "Half-finished payment",
            "Interrupted sync",
            "Partially sent notification"
        ],
        "howItWorks": [
            "Before retrying, read the current state from the service.",
            "If it already happened, do not repeat it.",
            "If it is half-done, run the compensation path."
        ],
        "youllNeed": "None.",
        "watchOut": "Always assume the last call succeeded; read state first.",
        "productTags": [
            "Fintech & Payments",
            "E-commerce",
            "SaaS"
        ],
        "relatedRecipes": [],
        "promptText": "Build crash-recovery reconciliation workflow verifying external provider state before retry and safely resuming interrupted sagas."
    }
];

// Re-export for compatibility with earlier component imports
export const PLAYBOOK_SCENARIOS = ALL_RECIPES.map((r) => ({
    id: r.id,
    number: "#" + String(r.id).padStart(2, "0"),
    title: r.title,
    level: r.level,
    category: r.category,
    categoryLabel: r.category,
    audience: r.audience,
    difficulty: r.difficulty,
    tagline: r.promise,
    promise: r.promise,
    whatYouCanBuild: r.whatYouCanBuild,
    howItWorks: r.howItWorks,
    youllNeed: r.youllNeed,
    watchOut: r.watchOut,
    productTags: r.productTags,
    relatedRecipes: r.relatedRecipes,
    promptText: r.promptText,
    // compatibility aliases
    steps: r.howItWorks,
    acceptance: [r.watchOut],
    units: ["Workflow", "Actor"] as ("Workflow" | "Actor")[],
}));

export const SCENARIO_CATEGORIES = [
    { id: "all", label: "All Recipes" },
    { id: "level-1", label: "Level 1: Basics (18)" },
    { id: "level-2", label: "Level 2: Common (20)" },
    { id: "level-3", label: "Level 3: Scale (22)" },
    { id: "level-4", label: "Level 4: Specialist (18)" },
];
