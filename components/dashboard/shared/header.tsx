import { Button } from "@/components/ui/button";
import React from "react";

const Header = () => {
  return (
    <div className="hidden md:block border-b border-border w-full h-16 bg-surface fixed top-0 z-50 shadow-sm px-6 py-2">
      <div className="flex items-center justify-between">
        <div className="text-lg font-black text-text-primary">Frontpage</div>
        <div className="flex items-center gap-3">
          <Button variant="outline">Sign Out</Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
