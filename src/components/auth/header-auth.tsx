"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Input } from "../ui/input";
import { ArrowRightIcon, SearchIcon } from "lucide-react";

const HeaderAuth = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="border-b border-border w-full h-16 bg-surface fixed top-0 z-50 shadow-sm pl-2 pr-6 py-2"
    >
      <div className="flex items-center justify-between">
        <div className="text-lg flex items-center gap-2 font-black text-text-primary">
          <Link
            className="hover:text-text-primary flex items-center gap-2"
            href="/"
          >
            <Image
              src="/images/icon-512.webp"
              alt="Frontpage"
              width={40}
              height={40}
            />
            Frontpage
          </Link>
          <span className="hidden md:inline text-text-secondary">|</span>
          <Link className="hover:text-text-primary hidden md:inline" href="/">
            RSS Feed Reader
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Link
              href="/guest"
              className="hidden md:flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-5 py-2.5 text-sm text-text-primary transition-colors hover:bg-bg-secondary font-bold"
            >
              <span>Try as Guest</span>{" "}
              <ArrowRightIcon className="size-6 ml-2 " />
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default HeaderAuth;
