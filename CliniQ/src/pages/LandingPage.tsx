import { Button } from "@/components/ui/button";
import { Activity, ArrowRight, Check, Heart, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingPage() {
  const features = [
    {
      icon: Users,
      title: "Health Network",
      description: "Monitor loved ones with consent-based access to health data",
    },
    {
      icon: Activity,
      title: "Live Vitals",
      description: "Real-time health metrics from connected devices",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Full control over who sees your health information",
    },
  ];

  const benefits = ["HIPAA Compliant", "End-to-end Encryption", "24/7 AI Health Assistant", "Device Agnostic"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg gradient-hero">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg sm:text-xl font-bold text-foreground">CliniQ</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                Sign in
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="text-xs sm:text-sm px-3 sm:px-4">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 sm:pt-32 pb-12 sm:pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="container relative px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-foreground">
              Connected Health <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Monitoring</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-muted-foreground px-4">
              Monitor health together with consent. Share vitals with family, caregivers, or healthcare providers. Stay connected, stay healthy.
            </p>

            <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3 sm:gap-4 sm:flex-row sm:justify-center">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="gap-2 px-6 sm:px-8 w-full sm:w-auto text-sm sm:text-base">
                  Start Monitoring <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="px-6 sm:px-8 w-full sm:w-auto text-sm sm:text-base">
                  View Demo
                </Button>
              </Link>
            </div>

            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-1.5 sm:gap-2">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-secondary" />
                  {benefit}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-20">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">Why Choose CliniQ?</h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground px-4">
              Built for modern healthcare with security, accessibility, and user experience at the forefront
            </p>
          </motion.div>

          <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-8 md:grid-cols-3">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="card-hover rounded-xl sm:rounded-2xl border border-border bg-card p-5 sm:p-8 text-center shadow-card"
              >
                <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                <h3 className="mt-4 sm:mt-5 font-heading text-lg sm:text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl sm:rounded-3xl gradient-hero p-8 sm:p-12 text-center"
          >
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-primary-foreground">Ready to Connect Your Health?</h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-primary-foreground/80">Join thousands of users monitoring health together</p>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="mt-4 sm:mt-6 px-6 sm:px-8 text-sm sm:text-base">
                Get Started Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

       {/* Footer */}
      <footer className="border-t border-border py-8 sm:py-12">
        <div className="container px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="font-heading font-semibold text-sm sm:text-base text-foreground">CliniQ</span>
            </Link>
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
              <Link to="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
              <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2025 CliniQ Health. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
