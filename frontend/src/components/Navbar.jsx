
import { useEffect, useState } from "react";
import { Heart, Leaf, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";

function Navbar() {
  const [activeSection, setActiveSection] = useState("home");

  const navItems = [
    { label: "Home", id: "home" },
    { label: "Ayurveda", id: "ayurveda" },
    { label: "AI Wellness", id: "ai-wellness" },
    { label: "AI Assistant", id: "chat" },
    { label: "My Journey", id: "journey" },
    { label: "Articles", id: "articles" },
  ];

  // Keep active navigation synchronized with the current section
  useEffect(() => {
    let ticking = false;

    const updateActiveSection = () => {
      if (window.location.hash === "#journey") {
        setActiveSection("journey");
        ticking = false;
        return;
      }

      if (window.location.hash === "#chat") {
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
      } else if (window.location.hash === "#chat") {
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

    // Open AI Assistant
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

    // Open My Journey
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

    // Return to homepage before scrolling
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
        className="h-[88px] sm:h-[96px]"
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-2xl border border-[#ded6c5]/90 bg-[#fffcf5]/95 px-3 py-2.5 shadow-[0_8px_28px_rgba(52,73,54,0.09)] backdrop-blur-xl sm:gap-4 sm:px-5">

          {/* LOGO */}
          <button
            type="button"
            onClick={() => scrollToSection("home")}
            aria-label="AyurAI home"
            className="group flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#697653]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#14532d] text-[#f8f4e9] shadow-sm transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-105">
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
                  className={`relative rounded-full px-3 py-2 text-[12px] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#697653] ${
                    isActive
                      ? "text-[#245333]"
                      : "text-[#746f60] hover:bg-[#f0efe5] hover:text-[#245333]"
                  }`}
                >
                  <span>{item.label}</span>

                  {isActive && (
                    <span
                      className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#56805a]"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ACTIONS */}
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">

            {/* AI ASSISTANT QUICK ACCESS */}
            <button
              type="button"
              onClick={() => scrollToSection("chat")}
              className={`${iconButtonClass} lg:hidden`}
              title="AI Assistant"
              aria-label="Open AI Assistant"
            >
              <MessageCircle size={17} strokeWidth={1.8} />
            </button>

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
              <div className="ml-1 flex items-center gap-1.5 sm:gap-2">
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="rounded-full px-2.5 py-2 text-xs font-medium text-[#34513a] transition-colors hover:bg-[#edf0e5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#697653] sm:px-4 sm:text-sm"
                  >
                    Sign In
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button
                    type="button"
                    className="rounded-full bg-[#14532d] px-3 py-2 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#1d6338] hover:shadow-md active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#697653] sm:px-4 sm:text-sm"
                  >
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            {/* LOGGED IN */}
            <SignedIn>
              <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-[#ded6c5] bg-white">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                    },
                  }}
                />
              </div>
            </SignedIn>

          </div>
        </div>
      </motion.nav>
    </>
  );
}

export default Navbar;
