"use client";
import { User } from "@supabase/supabase-js";
import React from "react";
import { Button } from "../ui/button";
import { signOut } from "@/src/actions/auth";
import Link from "next/link";
import { LogInIcon, LogOutIcon, SearchIcon } from "lucide-react";
import { Input } from "../ui/input";

type Props = {
  user: User | undefined;
};

const HeaderNav = ({ user }: Props) => {
  const handleSignOut = async () => {
    await signOut();
  };
  return (
    <div className="hidden md:block border-b border-border w-full h-16 bg-surface fixed top-0 z-50 shadow-sm px-6 py-2">
      <div className="flex items-center justify-between">
        <div className="text-lg flex items-center gap-2 font-black text-text-primary">
          <Link className="hover:text-text-primary" href="/">
            Frontpage
          </Link>
          <span className="text-text-secondary">|</span>
          <Link className="hover:text-text-primary" href="/dashboard">
            Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search articles..."
              className="pl-8"
            />
            <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary" />
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSignOut}>
                <LogOutIcon className="size-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/login" className="flex items-center gap-2">
                  <LogInIcon className="size-4" />
                  <span>Sign In</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderNav;
