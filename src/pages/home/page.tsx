import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  ArrowRight,
  BookOpenText,
  BrainCircuit,
  Eye,
  Rocket,
  Scale,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
            <Zap className="size-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">BAAL</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <ModeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/login">
              Get started
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center overflow-hidden pt-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="absolute right-0 bottom-0 h-[400px] w-[600px] rounded-full bg-primary/[0.02] blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Badge variant="outline" className="mb-6 gap-1.5 px-3 py-1 mt-6">
            <Sparkles className="size-3" />
            Truly no-code backend platform
          </Badge>
        </motion.div>

        <motion.h1
          className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          Describe your logic.
          <br />
          <span className="text-muted-foreground">We deploy it.</span>
        </motion.h1>

        <motion.p
          className="mx-auto mb-10 max-w-xl text-base text-muted-foreground sm:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          Write your business logic in plain, human-readable language. BAAL
          turns it into deployed, monitored, and auto-scaled backend
          units&mdash;no code, no configuration, no limits on scale.
        </motion.p>

        <motion.div
          className="flex flex-col items-center justify-center gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          <Button size="lg" asChild>
            <Link to="/login">
              Start building
              <ArrowRight />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#how-it-works">See how it works</a>
          </Button>
        </motion.div>

        <motion.div
          className="mx-auto mt-16 max-w-xl overflow-hidden rounded-xl border bg-card shadow-lg sm:mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        >
          <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
            <div className="flex gap-1.5">
              <div className="size-2.5 rounded-full bg-foreground/10" />
              <div className="size-2.5 rounded-full bg-foreground/10" />
              <div className="size-2.5 rounded-full bg-foreground/10" />
            </div>
            <span className="ml-2 text-xs text-muted-foreground">baal</span>
          </div>
          <div className="p-5 text-left font-mono text-sm leading-relaxed">
            <div className="text-muted-foreground">
              <span className="text-primary">$</span> When a user signs up,
              validate their email, hash the password, and store the account.
              Then send a welcome email.
            </div>
            <div className="mt-3 text-muted-foreground/70">
              <span className="text-emerald-500 dark:text-emerald-400">
                &#10003;
              </span>{" "}
              Unit created &mdash; user-signup
            </div>
            <div className="text-muted-foreground/70">
              <span className="text-emerald-500 dark:text-emerald-400">
                &#10003;
              </span>{" "}
              Deployed &amp; live
            </div>
            <div className="text-muted-foreground/70">
              <span className="text-emerald-500 dark:text-emerald-400">
                &#10003;
              </span>{" "}
              Monitoring enabled
            </div>
            <div className="text-muted-foreground/70">
              <span className="text-emerald-500 dark:text-emerald-400">
                &#10003;
              </span>{" "}
              Auto-scaling active
            </div>
            <div className="mt-3 text-muted-foreground">
              <span className="text-primary">&#8594;</span> Ready in{" "}
              <span className="text-foreground font-medium">3.1s</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: BrainCircuit,
    title: "Your logic is the source",
    description:
      "Describe your business logic in plain language. What you write is both the source of truth and the documentation\u2014fully human-readable, always up to date.",
  },
  {
    icon: Scale,
    title: "Built for large-scale applications",
    description:
      "Structure complex systems into manageable, composable units. BAAL is designed for production-grade applications that grow with your business.",
  },
  {
    icon: Rocket,
    title: "Instant deploy, zero configuration",
    description:
      "Every unit you describe becomes a deployed, live backend\u2014no servers to provision, no infrastructure to manage. Just describe and deploy.",
  },
  {
    icon: Eye,
    title: "Monitored & auto-scaled",
    description:
      "Every deployed unit is monitored out of the box. Traffic spikes? BAAL scales your units automatically based on real usage.",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="border-t py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Truly no-code. Truly production-ready.
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            Your business logic is the code, the documentation, and the
            deployment artifact\u2014all in one.
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50 transition-colors group-hover:bg-muted">
                <feature.icon className="size-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="mb-1 font-medium">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    step: "01",
    title: "Explain what you need",
    description:
      "Describe your business logic in plain, human-readable language. No syntax to learn, no frameworks to configure\u2014just say what should happen.",
  },
  {
    step: "02",
    title: "We create your units",
    description:
      "BAAL turns your descriptions into deployed backend units\u2014each one a self-contained, manageable piece of your application.",
  },
  {
    step: "03",
    title: "Monitor & scale automatically",
    description:
      "Every unit is monitored in real time. As your traffic grows, BAAL scales each unit independently based on actual usage.",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
            From idea to production in three steps
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            Explain what you want. We handle the rest\u2014deploy, monitor, and
            scale.
          </p>
        </motion.div>

        <div className="grid gap-12 sm:grid-cols-3">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.15 }}
            >
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full border bg-muted/50 text-sm font-semibold text-muted-foreground">
                {item.step}
              </div>
              <h3 className="mb-2 font-medium">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="border-t py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <BookOpenText className="mx-auto mb-6 size-10 text-muted-foreground/50" />
          <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Your logic speaks for itself
          </h2>
          <p className="mx-auto mb-8 max-w-md text-muted-foreground">
            Focus on your business rules. BAAL deploys, monitors, and scales
            your backend\u2014so you never think about infrastructure again.
          </p>
          <Button size="lg" asChild>
            <Link to="/login">
              Get started for free
              <ArrowRight />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex size-5 items-center justify-center rounded bg-primary">
            <Zap className="size-3 text-primary-foreground" />
          </div>
          BAAL
        </div>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} BAAL. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
