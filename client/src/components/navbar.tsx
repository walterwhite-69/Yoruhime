import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchWithSuggestions } from "./search-with-suggestions";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border smooth-transition">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 animate-fade-in">
          <div className="flex items-center gap-8">
            <Link href="/home">
              <div className="flex items-center gap-2 cursor-pointer smooth-transform hover:scale-105">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 bg-clip-text text-transparent" data-testid="link-home">
                  Yoruhime <span className="text-xl">夜姫</span>
                </h1>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/home" data-testid="link-nav-home">
                <span className="text-sm text-foreground hover:text-primary smooth-transition cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300">
                  Home
                </span>
              </Link>
              <Link href="/top-airing" data-testid="link-nav-top-airing">
                <span className="text-sm text-foreground hover:text-primary smooth-transition cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300">
                  Top Airing
                </span>
              </Link>
              <Link href="/trending" data-testid="link-nav-trending">
                <span className="text-sm text-foreground hover:text-primary smooth-transition cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300">
                  Trending
                </span>
              </Link>
              <Link href="/popular" data-testid="link-nav-popular">
                <span className="text-sm text-foreground hover:text-primary smooth-transition cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300">
                  Popular
                </span>
              </Link>
              <Link href="/latest-episodes" data-testid="link-nav-latest">
                <span className="text-sm text-foreground hover:text-primary smooth-transition cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300">
                  Latest Episodes
                </span>
              </Link>
              <Link href="/upcoming" data-testid="link-nav-upcoming">
                <span className="text-sm text-foreground hover:text-primary smooth-transition cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300">
                  Upcoming
                </span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <SearchWithSuggestions className="pl-9 w-64" />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-4 animate-slide-in-left">
            <div className="sm:hidden">
              <SearchWithSuggestions className="pl-9 w-full" testId="input-search-mobile" />
            </div>

            <nav className="flex flex-col gap-3">
              <Link href="/home">
                <span
                  className="text-sm text-foreground hover:text-primary transition-colors block cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-mobile-home"
                >
                  Home
                </span>
              </Link>
              <Link href="/top-airing">
                <span
                  className="text-sm text-foreground hover:text-primary transition-colors block cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-mobile-top-airing"
                >
                  Top Airing
                </span>
              </Link>
              <Link href="/trending">
                <span
                  className="text-sm text-foreground hover:text-primary transition-colors block cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-mobile-trending"
                >
                  Trending
                </span>
              </Link>
              <Link href="/popular">
                <span
                  className="text-sm text-foreground hover:text-primary transition-colors block cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-mobile-popular"
                >
                  Popular
                </span>
              </Link>
              <Link href="/latest-episodes">
                <span
                  className="text-sm text-foreground hover:text-primary transition-colors block cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-mobile-latest"
                >
                  Latest Episodes
                </span>
              </Link>
              <Link href="/upcoming">
                <span
                  className="text-sm text-foreground hover:text-primary transition-colors block cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-mobile-upcoming"
                >
                  Upcoming
                </span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
