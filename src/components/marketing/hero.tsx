"use client";
import { Check, LogInIcon, RssIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
const Hero = () => {
  return (
    <motion.section
      className="h-dvh hero-gradient"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative z-10 mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-24 h-full flex flex-col justify-center gap-4">
        <div className="flex flex-col items-start lg:items-center ">
          <div className="flex items-center justify-start lg:justify-center gap-2">
            <span className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center">
              <RssIcon className="size-3 text-accent" />
            </span>
            <p className="text-sm font-medium uppercase tracking-wide text-accent">
              RSS feed reader
            </p>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-start lg:text-center text-text-primary sm:text-4xl lg:text-5xl">
            Take control of your news feed
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-text-secondary text-start lg:text-center">
            Aggregate RSS and Atom feeds into a single, calm reading dashboard.
            Organize by category, track what you&apos;ve read, and focus on the
            content that matters.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-start flex-col lg:justify-center gap-3">
            <Link
              href="/signup"
              className="flex min-h-11 items-center justify-center rounded-lg btn-marketing px-5 py-2.5 text-sm text-white transition-colors hover:bg-accent-hover border-none font-bold"
            >
              <span>Create an account</span>{" "}
              <LogInIcon className="size-3 ml-2 " />
            </Link>
            <span className="text-text-secondary text-sm font-medium text-center flex items-center justify-center gap-2">
              <Check className="size-4 text-accent" /> No credit card required
            </span>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.35 }}
          className="flex items-center justify-center mt-10 lg:mt-0"
        >
          <Image
            src="/images/screenshot.png"
            alt="Screenshot of the RSS feed reader"
            width={1000}
            height={1000}
            sizes="(max-width: 1024px) 100vw, 1000px"
            loading="lazy"
            className="rounded-lg shadow-xl"
          />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Hero;
