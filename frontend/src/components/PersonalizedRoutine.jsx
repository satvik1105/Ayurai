
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/clerk-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sparkles,
  Sun,
  Utensils,
  Activity,
  Leaf,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  Flower2,
  Brain,
  Moon,
} from "lucide-react";

// Wellness sections displayed as individual cards
const recommendationTypes = [
  {
    title: "Morning Ritual",
    icon: Sun,
    color: "bg-amber-50 text-amber-700",
    patterns: ["morning ritual", "morning routine", "morning habits"],
  },
  {
    title: "Diet Recommendation",
    icon: Utensils,
    color: "bg-orange-50 text-orange-700",
    patterns: ["diet recommendation", "diet", "nutrition", "food recommendation"],
  },
  {
    title: "Daily Activity",
    icon: Activity,
    color: "bg-blue-50 text-blue-700",
    patterns: ["daily activity", "physical activity", "movement", "exercise"],
  },
  {
    title: "Mind & Focus",
    icon: Brain,
    color: "bg-purple-50 text-purple-700",
    patterns: [
      "mind and focus",
      "mind & focus",
      "lifestyle tip",
      "lifestyle",
      "daily tip",
      "wellness tip",
    ],
  },
  {
    title: "Evening & Sleep",
    icon: Moon,
    color: "bg-indigo-50 text-indigo-700",
    patterns: [
      "evening and sleep",
      "evening & sleep",
      "evening routine",
      "sleep routine",
      "your daily routine",
      "daily routine",
    ],
  },
];

function normalizeHeading(text = "") {
  return text
    .replace(/[*_`#]/g, "")
    .replace(/^\s*\d+[\s.)-]*/, "")
    .replace(/:$/, "")
    .trim()
    .toLowerCase();
}

// Convert AI Markdown response into separate wellness sections
function extractRecommendations(markdown = "") {
  const lines = markdown.split("\n");
  const sections = [];
  let currentSection = null;

  for (const line of lines) {
    const headingMatch = line.match(
      /^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/
    );

    const boldMatch = line.match(
      /^\s*\*\*(.+?)\*\*\s*:?\s*$/
    );

    const heading = headingMatch?.[1] || boldMatch?.[1];

    if (heading) {
      currentSection = {
        heading: normalizeHeading(heading),
        content: [],
      };

      sections.push(currentSection);
    } else if (currentSection) {
      currentSection.content.push(line);
    }
  }

  return recommendationTypes
    .map((type) => {
      const section = sections.find((item) =>
        type.patterns.some(
          (pattern) =>
            item.heading === pattern ||
            item.heading.includes(pattern)
        )
      );

      if (!section) return null;

      const content = section.content.join("\n").trim();

      if (!content) return null;

      return {
        ...type,
        content,
      };
    })
    .filter(Boolean);
}

function PersonalizedRoutine({ selectedGoal, answer1, answer2 }) {
  const [aiRoutine, setAiRoutine] = useState("");
  const [routineId, setRoutineId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settingCurrent, setSettingCurrent] = useState(false);
  const [isCurrent, setIsCurrent] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const { userId, isSignedIn } = useAuth();

  const goal = selectedGoal
    ? selectedGoal.title ||
      selectedGoal.name ||
      selectedGoal.id ||
      selectedGoal
    : "";

  const recommendations = useMemo(
    () => extractRecommendations(aiRoutine),
    [aiRoutine]
  );

  // Automatically scroll directly to the loading card / generated routine
  useEffect(() => {
    let scrollFrame;
    let secondScrollFrame;

    if (loading) {
      scrollFrame = window.requestAnimationFrame(() => {
        const loadingCard = document.getElementById(
          "ai-routine-loading"
        );

        if (loadingCard) {
          loadingCard.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }

        // Second scroll ensures the card is visible after rendering.
        secondScrollFrame = window.requestAnimationFrame(() => {
          document.getElementById("ai-routine-loading")?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        });
      });
    } else if (aiRoutine) {
      scrollFrame = window.requestAnimationFrame(() => {
        document.getElementById("ai-routine-result")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }

    return () => {
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      if (secondScrollFrame) {
        window.cancelAnimationFrame(secondScrollFrame);
      }
    };
  }, [loading, aiRoutine]);

  // Generate personalized routine
  useEffect(() => {
    if (!goal || !answer1 || !answer2 || !userId) {
      setAiRoutine("");
      setRoutineId(null);
      setIsCurrent(false);
      setError("");
      return;
    }

    const generateRoutine = async () => {
      try {
        setLoading(true);
        setError("");
        setAiRoutine("");
        setRoutineId(null);
        setIsCurrent(false);

        const response = await fetch("http://localhost:5000/api/ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clerkId: userId,
            goal,
            diet: answer1,
            experience: answer2,
            question: `
Create a personalized Ayurvedic-inspired wellness routine for today.

User's wellness goal: ${goal}
User's diet preference: ${answer1}
User's Ayurveda experience: ${answer2}

Structure the response using these exact Markdown headings:

## Morning Ritual
Give practical morning habits personalized to this user.

## Diet Recommendation
Suggest suitable everyday food and hydration habits based on the user's diet preference.

## Daily Activity
Suggest a realistic movement, exercise, or relaxation activity.

## Mind & Focus
Give practical mental wellness techniques and mindfulness suggestions.

## Evening & Sleep
Give useful evening habits and sleep guidance.

Keep every section beginner-friendly, practical and specific to the information provided.

Use short paragraphs and bullet points wherever appropriate.
Do not repeat the same recommendations in multiple sections.
Do not diagnose diseases, promise medical results, or prescribe medicines or supplements.
Clearly distinguish general wellness suggestions from medical advice.
Do not invent personal information about the user.
            `.trim(),
          }),
        });

        const data = await response.json();

        console.log("🌿 AI RESPONSE:", data);

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              "AI response failed."
          );
        }

        if (!data?.answer) {
          throw new Error("AI did not return an answer.");
        }

        setAiRoutine(data.answer);

        if (data.routineId) {
          setRoutineId(data.routineId);

          console.log("🌿 ROUTINE ID:", data.routineId);

          window.dispatchEvent(
            new CustomEvent("ayurAI:routines-updated")
          );
        }
      } catch (err) {
        console.error("❌ AI ROUTINE ERROR:", err);

        setError(
          err?.message || "Unable to generate your AI routine."
        );
      } finally {
        setLoading(false);
      }
    };

    generateRoutine();
  }, [goal, answer1, answer2, userId, retryCount]);

  // Set routine as current
  const handleSetCurrentRoutine = async () => {
    if (!userId) {
      setError("Please sign in before selecting a routine.");
      return;
    }

    if (!routineId) {
      setError("Routine ID not found. Please generate the routine again.");
      return;
    }

    try {
      setSettingCurrent(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/routines/${userId}/current`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            routineId,
          }),
        }
      );

      const data = await response.json();

      console.log("🌿 CURRENT ROUTINE RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to set current routine."
        );
      }

      setIsCurrent(true);

      localStorage.setItem(
        "ayurAI_currentRoutine",
        JSON.stringify(data.routine)
      );

      window.dispatchEvent(
        new Event("ayurAICurrentRoutineUpdated")
      );
    } catch (err) {
      console.error("❌ CURRENT ROUTINE ERROR:", err);

      setError(
        err?.message || "Unable to set current routine."
      );
    } finally {
      setSettingCurrent(false);
    }
  };

  if (!selectedGoal) return null;

  return (
    <section
      id="ai-wellness"
      className="relative overflow-hidden bg-[#f7f5ed] px-4 py-16 sm:px-6 sm:py-20"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#dce8d5]/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-[#e9e4ce]/60 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          {/* Section heading */}
          <div className="mb-10 text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d6e2d0] bg-white/80 px-4 py-2 text-sm font-semibold text-[#315c42] shadow-sm">
              <Sparkles size={16} />
              AI-Powered Personalization
            </div>

            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[#183f2b] sm:text-4xl md:text-5xl">
              Your Wellness,
              <span className="block text-[#66876a]">
                Your Way.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#657466] sm:text-lg">
              A personalized Ayurvedic-inspired wellness plan,
              created around your goal, diet, and experience.
            </p>
          </div>

          {/* Selected goal card */}
          <div className="mb-10 rounded-3xl border border-[#dce5d7] bg-white/90 p-5 shadow-[0_8px_30px_rgba(35,70,45,0.05)] sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e8efe3] text-[#28543a]">
                  <Flower2 size={28} />
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-[0.12em] text-[#718071]">
                    YOUR SELECTED WELLNESS GOAL
                  </p>

                  <h3 className="mt-2 text-xl font-semibold text-[#1b422d] sm:text-2xl">
                    {goal}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#718071]">
                    Personalized using your submitted preferences.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
                <div className="rounded-2xl border border-[#edf0e8] bg-[#f5f6ef] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#56715a]">
                    <Utensils size={16} />
                    <span className="text-xs font-semibold tracking-wide">
                      DIET
                    </span>
                  </div>

                  <p className="break-words text-sm font-medium leading-6 text-[#294b34]">
                    {answer1 || "Not provided"}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#edf0e8] bg-[#f5f6ef] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#56715a]">
                    <Leaf size={16} />
                    <span className="text-xs font-semibold tracking-wide">
                      EXPERIENCE
                    </span>
                  </div>

                  <p className="break-words text-sm font-medium leading-6 text-[#294b34]">
                    {answer2 || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Loading state */}
            {loading && (
              <motion.div
                id="ai-routine-loading"
                key="loading"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="scroll-mt-24 rounded-3xl border border-[#dce5d7] bg-white/90 px-6 py-14 text-center shadow-sm"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f0e4] text-[#315c42]">
                  <RefreshCw size={28} className="animate-spin" />
                </div>

                <h3 className="text-xl font-semibold text-[#20472f] sm:text-2xl">
                  Creating Your Personal Wellness Plan
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#738072] sm:text-base">
                  Our AI is preparing recommendations based on
                  your goal and preferences. This may take a moment.
                </p>

                <div className="mx-auto mt-7 h-1.5 max-w-xs overflow-hidden rounded-full bg-[#e9eee5]">
                  <motion.div
                    className="h-full rounded-full bg-[#527b58]"
                    initial={{ width: "8%" }}
                    animate={{ width: "95%" }}
                    transition={{
                      duration: 8,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Error state */}
            {!loading && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-red-200 bg-white p-7 text-center shadow-sm sm:p-10"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <RefreshCw size={24} />
                </div>

                <h3 className="text-xl font-semibold text-[#20472f]">
                  We Couldn't Generate Your Routine
                </h3>

                <p className="mx-auto mt-3 max-w-lg break-words text-sm leading-7 text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => setRetryCount((count) => count + 1)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#214c34] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173b28]"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              </motion.div>
            )}

            {/* Personalized routine cards */}
            {!loading && !error && aiRoutine && (
              <motion.div
                key="routine"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                {/* Routine heading */}
                <div id="ai-routine-result" className="mb-8 scroll-mt-24">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#66816a]">
                    <Sparkles size={16} />
                    Made For You
                  </div>

                  <h3 className="text-2xl font-semibold tracking-tight text-[#1d442e] sm:text-3xl">
                    Your Daily Wellness Routine
                  </h3>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#738072] sm:text-base">
                    Your personalized wellness guidance, organized
                    into simple steps for your day.
                  </p>
                </div>

                {/* Responsive premium card grid */}
                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 md:gap-7">
                    {recommendations.map((item, index) => {
                      const Icon = item.icon;

                      const isLastOddCard =
                        recommendations.length % 2 !== 0 &&
                        index === recommendations.length - 1;

                      return (
                        <motion.article
                          key={item.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.45,
                            delay: index * 0.08,
                          }}
                          className={`group flex h-full flex-col rounded-3xl border border-[#dce5d7] bg-white p-7 shadow-[0_5px_22px_rgba(35,70,45,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c6d7c1] hover:shadow-[0_14px_35px_rgba(35,70,45,0.11)] sm:p-9 ${
                            isLastOddCard
                              ? "md:col-span-2 md:mx-auto md:w-full md:max-w-[calc(50%-0.875rem)]"
                              : ""
                          }`}
                        >
                          {/* Card top */}
                          <div className="mb-7 flex items-center justify-between">
                            <div
                              className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${item.color}`}
                            >
                              <Icon size={25} strokeWidth={1.8} />
                            </div>

                            <span className="text-xs font-semibold tracking-[0.16em] text-[#a0aa9c]">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          </div>

                          {/* Card title */}
                          <h4 className="mb-5 text-lg font-semibold tracking-tight text-[#244a32] sm:text-xl">
                            {item.title}
                          </h4>

                          {/* Card content */}
                          <div className="flex-1">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => (
                                  <p className="mb-4 text-sm leading-8 text-[#647265] last:mb-0 sm:text-[15px]">
                                    {children}
                                  </p>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-[#31583c]">
                                    {children}
                                  </strong>
                                ),
                                ul: ({ children }) => (
                                  <ul className="my-5 list-disc space-y-3 pl-5 text-sm leading-7 text-[#647265] sm:text-[15px]">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="my-5 list-decimal space-y-3 pl-5 text-sm leading-7 text-[#647265] sm:text-[15px]">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="pl-1 leading-7 marker:text-[#77947a]">
                                    {children}
                                  </li>
                                ),
                                h1: ({ children }) => (
                                  <h5 className="mb-3 mt-5 text-base font-semibold text-[#244a32]">
                                    {children}
                                  </h5>
                                ),
                                h2: ({ children }) => (
                                  <h5 className="mb-3 mt-5 text-base font-semibold text-[#244a32]">
                                    {children}
                                  </h5>
                                ),
                                h3: ({ children }) => (
                                  <h5 className="mb-3 mt-5 text-base font-semibold text-[#244a32]">
                                    {children}
                                  </h5>
                                ),
                              }}
                            >
                              {item.content}
                            </ReactMarkdown>
                          </div>

                          {/* Bottom accent */}
                          <div className="mt-7 h-px w-full bg-gradient-to-r from-[#dce8d5] via-[#edf1e9] to-transparent" />
                        </motion.article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-[#dce5d7] bg-white p-6 shadow-sm">
                    <p className="text-sm leading-7 text-[#647265]">
                      The AI response could not be divided into separate
                      sections. Please try generating the routine again.
                    </p>

                    <button
                      type="button"
                      onClick={() => setRetryCount((count) => count + 1)}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#214c34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173b28]"
                    >
                      <RefreshCw size={16} />
                      Generate Again
                    </button>
                  </div>
                )}

                {/* Set current routine */}
                {isSignedIn && routineId && (
                  <div className="mt-9 flex flex-col items-center justify-center gap-3 text-center">
                    <button
                      type="button"
                      onClick={handleSetCurrentRoutine}
                      disabled={settingCurrent || isCurrent}
                      className={`inline-flex min-h-14 items-center justify-center gap-3 rounded-full px-8 py-4 text-sm font-semibold transition-all duration-300 sm:text-base ${
                        isCurrent
                          ? "cursor-default bg-[#e2eddf] text-[#315c42]"
                          : "bg-[#214c34] text-white shadow-[0_8px_20px_rgba(33,76,52,0.2)] hover:-translate-y-0.5 hover:bg-[#173b28] hover:shadow-lg disabled:cursor-wait disabled:opacity-70"
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <CheckCircle2 size={19} />
                          Current Routine Selected
                        </>
                      ) : settingCurrent ? (
                        <>
                          <RefreshCw
                            size={17}
                            className="animate-spin"
                          />
                          Setting Your Routine...
                        </>
                      ) : (
                        <>
                          Set as Current Routine
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    {isCurrent && (
                      <p className="flex items-center gap-2 text-sm font-medium text-[#527557]">
                        <CheckCircle2 size={16} />
                        Saved as your current routine.
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Independent Wellness Disclaimer */}
          {selectedGoal && (
            <div className="mt-12 rounded-3xl border border-[#dedfce] bg-[#f0f0e6] px-6 py-8 shadow-sm sm:px-9 sm:py-9">
              <div className="mx-auto max-w-4xl">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#527557] shadow-sm">
                    <ShieldCheck size={23} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#71836d]">
                      Important Information
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-[#294d34]">
                      Wellness Disclaimer
                    </h3>
                  </div>
                </div>

                <p className="text-sm leading-8 text-[#687867] sm:text-base">
                  The wellness routines and recommendations provided by AyurAI
                  are generated using artificial intelligence and are intended
                  for general educational and informational purposes only.
                  They should not be considered medical advice, diagnosis, or
                  treatment.
                </p>

                <p className="mt-4 text-sm leading-8 text-[#687867] sm:text-base">
                  Individual health needs may vary. Always consider your personal
                  comfort, health conditions, allergies, and dietary requirements
                  before following any recommendation.
                </p>

                <p className="mt-4 text-sm leading-8 text-[#687867] sm:text-base">
                  AyurAI does not replace consultation with qualified healthcare
                  professionals. Please seek professional medical guidance for
                  any health concerns or before making significant changes to
                  your diet, exercise, or wellness routine.
                </p>

                <div className="mt-6 border-t border-[#d9dece] pt-5">
                  <p className="text-xs font-medium leading-6 text-[#788574]">
                    By using AyurAI, you acknowledge that you are responsible
                    for your personal wellness decisions and how you apply
                    the information provided.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading &&
            !error &&
            !aiRoutine &&
            goal &&
            answer1 &&
            answer2 && (
              <div className="rounded-3xl border border-[#dce5d7] bg-white p-8 text-center">
                <p className="text-[#718071]">
                  Your personalized routine will appear here shortly.
                </p>
              </div>
            )}
        </motion.div>
      </div>
    </section>
  );
}

export default PersonalizedRoutine;
