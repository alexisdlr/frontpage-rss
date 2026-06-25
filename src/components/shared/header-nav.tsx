"use client";

import { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  FolderIcon,
  FolderPlusIcon,
  LogInIcon,
  LogOutIcon,
  PlusIcon,
  RssIcon,
  SearchIcon,
} from "lucide-react";
import { useState } from "react";

import { signOut } from "@/src/actions/auth";
import { startNavigationProgress } from "@/src/lib/navigation-progress";
import { AddCategoryDialog } from "@/src/components/dashboard/categories/add-category-dialog";
import { AddFeedDialog } from "@/src/components/dashboard/feeds/add-feed-dialog";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Input } from "@/src/components/ui/input";

import type { CategoryWithMeta } from "@/src/types/actions";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { motion } from "framer-motion";
import EditCategoriesDialog from "../dashboard/categories/edit-categories-dialog";
import SearchFeedsInput from "./search-feeds";

type Props = {
  user: User | undefined;
  categories: CategoryWithMeta[];
  feedCountByCategory?: Record<string, number>;
};

const HeaderNav = ({ user, categories, feedCountByCategory = {} }: Props) => {
  const [feedDialogOpen, setFeedDialogOpen] = useState(false);
  const [editCategoriesDialogOpen, setEditCategoriesDialogOpen] =
    useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const pathname = usePathname();
  const isDashboard =
    pathname === "/dashboard" ||
    pathname === "/saved" ||
    pathname === "/search" ||
    pathname.includes("/category") ||
    pathname.includes("/feed") ||
    pathname.includes("/reader");
  const isMarketing = pathname === "/";
  const isGuestMode = pathname === "/guest";
  const handleSignOut = async () => {
    startNavigationProgress({ showOverlay: true });
    await signOut();
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "hidden md:block border-b border-border w-full h-16 bg-surface fixed top-0 z-50 shadow-sm pl-2 pr-6 py-2",
          isMarketing && "block",
        )}
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
            {isDashboard ? (
              <Link
                className="hover:text-text-primary hidden md:inline"
                href="/dashboard"
              >
                Dashboard
              </Link>
            ) : null}
            {isMarketing ? (
              <Link
                className="hover:text-text-primary hidden md:inline"
                href="/"
              >
                RSS Feed Reader
              </Link>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            {user && isDashboard ? (
              <>
                <SearchFeedsInput />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="cursor-pointer"
                      aria-label="Add feed or category"
                    >
                      <PlusIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      className="cursor-pointer transition-all duration-300"
                      onSelect={() => setFeedDialogOpen(true)}
                    >
                      <RssIcon className="size-4" />
                      Add feed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer transition-all duration-300"
                      onSelect={() => setCategoryDialogOpen(true)}
                    >
                      <FolderPlusIcon className="size-4" />
                      Add category
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer transition-all duration-300"
                      onSelect={() => setEditCategoriesDialogOpen(true)}
                    >
                      <FolderIcon className="size-4" />
                      Edit categories
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOutIcon className="size-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link href="/login" className="flex items-center gap-2">
                    <LogInIcon className="size-4" />
                    <span>Sign In</span>
                  </Link>
                </Button>
                {isGuestMode ? (
                  <Link
                    href="/signup"
                    className="inline-flex  items-center justify-center rounded-lg border border-border bg-surface px-5  text-sm text-text-primary transition-colors hover:bg-bg-secondary font-bold"
                  >
                    <span>Create an account</span>{" "}
                    <ArrowRightIcon className="size-4 ml-2 " />
                  </Link>
                ) : (
                  <Link
                    href="/guest"
                    className="hidden md:flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-5 py-2.5 text-sm text-text-primary transition-colors hover:bg-bg-secondary font-bold"
                  >
                    <span>Try as Guest</span>{" "}
                    <ArrowRightIcon className="size-6 ml-2 " />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {user ? (
        <>
          <AddFeedDialog
            categories={categories}
            open={feedDialogOpen}
            onOpenChange={setFeedDialogOpen}
            showTrigger={false}
          />
          <AddCategoryDialog
            open={categoryDialogOpen}
            onOpenChange={setCategoryDialogOpen}
            showTrigger={false}
          />
          <EditCategoriesDialog
            categories={categories}
            feedCountByCategory={feedCountByCategory}
            open={editCategoriesDialogOpen}
            onOpenChange={setEditCategoriesDialogOpen}
          />
        </>
      ) : null}
    </>
  );
};

export default HeaderNav;
