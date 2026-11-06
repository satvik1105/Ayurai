
import { useEffect, useState } from "react";
import {
  Heart,
  Leaf,
  MessageCircle,
  Menu,
  X,
  Sparkles,
  BookOpen,
  Home,
  UserRound,
  Flower2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";

function Navbar() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", id: "home", icon: Home },
    { label: "Ayurveda", id: "ayurveda", icon: Flower2 },
    { label: "AI Wellness", id: "ai-wellness", icon: Sparkles },
    { label: "AI Assistant", id: "chat", icon: MessageCircle },
    { label: "My Journey", id: "journey", icon: UserRound },
    { label: "Articles", id: "articles", icon: BookOpen },
  ];

  // Keep active navigation synchronized with current section
  useEffect(() => {
    let ticking = false;

    const updateActiveSection = () => {
      if (window.location.hash === "#journey") {
        setActiveSection("journey");
        ticking = false;
        return;
      }

      if (
        window.location.hash === "#chat" ||
        window.location.hash === "#ayurai-chat"
      ) {
        setActiveSection("chat");
        ticking = false;
        return;
      }

      const marker = 160;
      let currentSection = "home";

      for (const item of navItems) {
        if (item.id === "journey" || item.id === "chat") continue;

        const section = document.getElementById(item.id);

        if (!section) continue;

        if (section.getBoundingClientRect().top <= marker) {
          currentSection = item.id;
        }
      }

      setActiveSection(currentSection);
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(updateActiveSection);
    };

    const handleHashChange = () => {
      if (window.location.hash === "#journey") {
        setActiveSection("journey");
      } else if (
        window.location.hash === "#chat" ||
        window.location.hash === "#ayurai-chat"
      ) {
        setActiveSection("chat");
      } else {
        handleScroll();
      }
    };

    updateActiveSection();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleScroll);
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Navigate to homepage sections or other pages
  const scrollToSection = (id) => {
    setActiveSection(id);
    setMobileMenuOpen(false);

    if (id === "chat") {
      window.location.hash = "chat";

      window.dispatchEvent(
        new Event("navigateAyurAIChat")
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (id === "journey") {
      window.location.hash = "journey";

      window.dispatchEvent(
        new Event("navigateAyurAIJourney")
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    window.location.hash = "";

    window.dispatchEvent(
      new Event("navigateAyurAIHome")
    );

    window.setTimeout(() => {
      const element = document.getElementById(id);

      if (!element) {
        console.warn(`Navbar section not found: #${id}`);
        return;
      }

      const navbarOffset = 105;

      const targetPosition =
        element.getBoundingClientRect().top +
        window.scrollY -
        navbarOffset;

      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: "smooth",
      });
    }, 200);
  };

  // Open My Journey and display wishlist
  const handleWishlist = () => {
    setActiveSection("journey");
    setMobileMenuOpen(false);

    window.location.hash = "journey";

    window.dispatchEvent(
      new Event("navigateAyurAIJourney")
    );

    window.setTimeout(() => {
      window.dispatchEvent(
        new Event("openAyurAIWishlist")
      );
    }, 300);
  };

  const iconButtonClass =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#52634d] transition-all duration-200 hover:bg-[#e9eddf] hover:text-[#245333] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#697653]";

  return (
    <>
      {/* Reserve space for fixed navbar */}
      <div
        aria-hidden="true"
        className="h-[76px] sm:h-[96px]"
      />

      <motion.nav
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.45,
          ease: "easeOut",
        }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4"
      >
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-2xl border border-[#ded6c5]/90 bg-[#fffcf5]/95 px-3 py-2.5 shadow-[0_8px_28px_rgba(52,73,54,0.09)] backdrop-blur-xl sm:gap-4 sm:px-5">

          {/* LOGO */}
          <button
            type="button"
            onClick={() => scrollToSection("home")}
            aria-label="AyurAI home"
            className="group flex min-w-0 shrink-0 items-center gap-2.5 rounded-xl"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#14532d] text-[#f8f4e9] shadow-sm transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-105">
              <Leaf size={18} strokeWidth={1.8} />
            </span>

            <span className="text-lg font-semibold tracking-[-0.04em] text-[#263d2b] sm:text-xl">
              AyurAI
            </span>
          </button>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  aria-current={isActive ? "location" : undefined}
                  className={`relative whitespace-nowrap rounded-full px-3 py-2 text-[12px] font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-[#245333]"
                      : "text-[#746f60] hover:bg-[#f0efe5] hover:text-[#245333]"
                  }`}
                >
                  {item.label}

                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#56805a]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* ACTIONS */}
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">

            {/* WISHLIST */}
            <button
              type="button"
              onClick={handleWishlist}
              className={iconButtonClass}
              title="My Wishlist"
              aria-label="My Wishlist"
            >
              <Heart size={17} strokeWidth={1.8} />
            </button>

            {/* LOGGED OUT */}
            <SignedOut>
              <div className="ml-1 hidden items-center gap-1.5 sm:flex">
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="rounded-full px-3 py-2 text-xs font-medium text-[#34513a] transition-colors hover:bg-[#edf0e5] sm:px-4 sm:text-sm"
                  >
                    Sign In
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button
                    type="button"
                    className="rounded-full bg-[#14532d] px-3 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-[#1d6338] sm:px-4 sm:text-sm"
                  >
                    Sign Up
                  </button>
                </SignUpButton>
              </div>

              {/* Mobile Sign In */}
              <div className="ml-1 sm:hidden">
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="rounded-full bg-[#14532d] px-3 py-2 text-xs font-semibold text-white"
                  >
                    Sign In
                  </button>
                </SignInButton>
              </div>
            </SignedOut>

            {/* LOGGED IN */}
            <SignedIn>
              <div className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#ded6c5] bg-white">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                    },
                  }}
                />
              </div>
            </SignedIn>

            {/* MOBILE MENU BUTTON */}
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((previous) => !previous)
              }
              className={`${iconButtonClass} lg:hidden`}
              aria-label={
                mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl border border-[#ded6c5] bg-[#fffcf5] p-3 shadow-xl lg:hidden"
            >
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      aria-current={isActive ? "location" : undefined}
                      className={`flex min-h-12 min-w-0 items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#e6eddf] text-[#14532d]"
                          : "bg-[#f7f4eb] text-[#52634d] hover:bg-[#edf0e5]"
                      }`}
                    >
                      <Icon size={17} className="shrink-0" />
                      <span className="min-w-0 truncate">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 border-t border-[#e8e1d4] pt-3">
                <button
                  type="button"
                  onClick={handleWishlist}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-[#52634d] hover:bg-[#edf0e5]"
                >
                  <Heart size={17} />
                  My Wishlist
                </button>

                <SignedOut>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <SignInButton mode="modal">
                      <button
                        type="button"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-xl border border-[#cdd7c6] px-3 py-3 text-sm font-semibold text-[#34513a]"
                      >
                        Sign In
                      </button>
                    </SignInButton>

                    <SignUpButton mode="modal">
                      <button
                        type="button"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-xl bg-[#14532d] px-3 py-3 text-sm font-semibold text-white"
                      >
                        Sign Up
                      </button>
                    </SignUpButton>
                  </div>
                </SignedOut>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

export default Navbar;
