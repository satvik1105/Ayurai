
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  History,
  ChartNoAxesCombined,
  Leaf,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import RoutineHistory from "../components/RoutineHistory";
import ProgressDashboard from "./ProgressDashboard";

export default function MyJourney() {
  const [activeTab, setActiveTab] = useState("history");

  useEffect(() => {
    const openHistory = () => {
      setActiveTab("history");
    };

    window.addEventListener("openAyurAIWishlist", openHistory);

    return () => {
      window.removeEventListener("openAyurAIWishlist", openHistory);
    };
  }, []);

  const tabs = [
    {
      id: "history",
      label: "My History",
      description: "Your saved wellness routines",
      icon: History,
    },
    {
      id: "progress",
      label: "My Progress",
      description: "Your wellness overview",
      icon: ChartNoAxesCombined,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3ebdd] px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-[#dce5cf]/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-96 h-64 w-64 rounded-full bg-[#e9d8bd]/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Page heading */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-9 text-center sm:mb-12"
        >
          <div className="mx-auto mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-[22px] border border-white/70 bg-[#14532d] text-[#f8f4e9] shadow-[0_12px_30px_rgba(20,83,45,0.18)]">
            <Leaf size={31} strokeWidth={1.7} />
          </div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d9dfcd] bg-[#fffcf5]/80 px-4 py-2">
            <Sparkles size={14} className="text-[#66805b]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#58704e] sm:text-xs">
              Your Personal Space
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[#263d2b] sm:text-5xl">
            My Wellness Journey
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#746f60] sm:text-base">
            Your wellness journey, all in one place. Revisit your
            routines, reflect on your progress, and keep building
            healthier habits at your own pace.
          </p>

          <div className="mx-auto mt-6 flex items-center justify-center gap-2 text-xs font-medium text-[#66805b]">
            <span className="h-px w-8 bg-[#bdc9ad]" />
            <Leaf size={13} />
            <span>Small steps. Better balance.</span>
            <span className="h-px w-8 bg-[#bdc9ad]" />
          </div>
        </motion.header>

        {/* Tab navigation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mx-auto mb-8 max-w-2xl"
        >
          <div
            role="tablist"
            aria-label="Wellness journey sections"
            className="grid grid-cols-2 gap-2 rounded-[22px] border border-[#e0d8c8] bg-[#fffcf5]/90 p-2 shadow-[0_8px_30px_rgba(55,65,40,0.05)] backdrop-blur-sm"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  id={`journey-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`journey-panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl px-3 py-4 text-left transition-colors duration-200 sm:px-5 ${
                    selected
                      ? "text-white"
                      : "text-[#687260] hover:bg-[#edf0e5]"
                  }`}
                >
                  {selected && (
                    <motion.div
                      layoutId="journey-active-tab"
                      className="absolute inset-0 rounded-2xl bg-[#14532d] shadow-md"
                      transition={{
                        type: "spring",
                        stiffness: 360,
                        damping: 30,
                      }}
                    />
                  )}

                  <span
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      selected
                        ? "bg-white/15 text-white"
                        : "bg-[#e9eddf] text-[#496744]"
                    }`}
                  >
                    <Icon size={19} strokeWidth={1.8} />
                  </span>

                  <span className="relative z-10 min-w-0">
                    <span className="block text-xs font-bold sm:text-sm">
                      {tab.label}
                    </span>
                    <span
                      className={`mt-1 hidden text-[11px] sm:block ${
                        selected ? "text-white/75" : "text-[#8b8b78]"
                      }`}
                    >
                      {tab.description}
                    </span>
                  </span>

                  {selected && (
                    <ArrowRight
                      size={16}
                      className="relative z-10 ml-auto hidden shrink-0 sm:block"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content panel */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-w-0"
        >
          {activeTab === "history" ? (
            <section
              id="journey-panel-history"
              role="tabpanel"
              aria-labelledby="journey-tab-history"
              className="min-w-0 rounded-[26px] border border-[#e3dac8] bg-[#fffcf5]/55 shadow-[0_12px_40px_rgba(55,65,40,0.04)] sm:rounded-[32px]"
            >
              <RoutineHistory />
            </section>
          ) : (
            <section
              id="journey-panel-progress"
              role="tabpanel"
              aria-labelledby="journey-tab-progress"
              className="min-w-0 rounded-[26px] border border-[#e3dac8] bg-[#fffcf5]/55 shadow-[0_12px_40px_rgba(55,65,40,0.04)] sm:rounded-[32px]"
            >
              <ProgressDashboard />
            </section>
          )}
        </motion.div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-10 text-center"
        >
          <p className="text-xs leading-6 text-[#898572]">
            Wellness is a journey, not a destination.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
