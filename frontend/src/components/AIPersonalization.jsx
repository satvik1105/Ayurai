
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Leaf,
  ShieldCheck,
  Brain,
  Moon,
  Sun,
  Heart,
  Activity,
} from "lucide-react";
import {
  useAuth,
  SignInButton,
  useClerk,
} from "@clerk/clerk-react";

const questions = {
  "deep-sleep": {
    title: "Let's understand your sleep",
    subtitle: "A few answers will help AyurAI personalize your evening journey.",
    question1: {
      label: "What's your usual bedtime?",
      options: ["Before 10 PM", "10 PM – 11 PM", "11 PM – 1 AM", "After 1 AM"],
    },
    question2: {
      label: "What's your biggest challenge?",
      options: [
        "Can't fall asleep",
        "Wake up frequently",
        "Wake up tired",
        "Irregular sleep schedule",
      ],
    },
  },
  "glowing-skin": {
    title: "Let's understand your skin goals",
    subtitle: "Tell AyurAI a little about what you want to improve.",
    question1: {
      label: "What would you like to focus on?",
      options: ["Glow", "Hydration", "Skin texture", "Simple routine"],
    },
    question2: {
      label: "How would you describe your routine?",
      options: ["No routine", "Basic routine", "Regular skincare", "Detailed routine"],
    },
  },
  "stress-relief": {
    title: "Let's understand your daily stress",
    subtitle: "Your answers help AyurAI create a calmer routine.",
    question1: {
      label: "When do you feel most stressed?",
      options: ["Morning", "Afternoon", "Evening", "Throughout the day"],
    },
    question2: {
      label: "What helps you relax?",
      options: ["Breathing", "Meditation", "Music", "Quiet time"],
    },
  },
  "energy-focus": {
    title: "Let's understand your energy",
    subtitle: "Tell AyurAI about your daily routine and focus.",
    question1: {
      label: "When is your energy lowest?",
      options: ["Morning", "Afternoon", "Evening", "It varies"],
    },
    question2: {
      label: "What's your biggest challenge?",
      options: ["Low energy", "Poor focus", "Too many distractions", "Irregular routine"],
    },
  },
  "joint-care": {
    title: "Let's understand your mobility goals",
    subtitle: "A few answers will help AyurAI personalize your wellness routine.",
    question1: {
      label: "When do you notice the most discomfort?",
      options: ["Morning", "After sitting", "After activity", "It varies"],
    },
    question2: {
      label: "What would you like to improve?",
      options: ["Mobility", "Flexibility", "Daily movement", "Routine consistency"],
    },
  },
  "digestive-wellness": {
    title: "Let's understand your digestive routine",
    subtitle: "Tell AyurAI about your daily habits so your journey can be personalized.",
    question1: {
      label: "When do you notice digestive discomfort?",
      options: ["Morning", "After meals", "Evening", "It varies"],
    },
    question2: {
      label: "What would you like to improve?",
      options: ["Meal routine", "Mindful eating", "Daily habits", "Routine consistency"],
    },
  },
};

const goalDetails = {
  "deep-sleep": {
    name: "Deep Sleep",
    icon: Moon,
  },
  "glowing-skin": {
    name: "Glowing Skin",
    icon: Sun,
  },
  "stress-relief": {
    name: "Stress Relief",
    icon: Brain,
  },
  "energy-focus": {
    name: "Energy & Focus",
    icon: Activity,
  },
  "joint-care": {
    name: "Joint Care",
    icon: Heart,
  },
  "digestive-wellness": {
    name: "Digestive Wellness",
    icon: Leaf,
  },
};

function AIPersonalization({ selectedGoal, setAnswers }) {
  const { userId, isSignedIn, getToken } = useAuth();
  const { openSignIn } = useClerk();

  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const goalId =
    typeof selectedGoal === "string"
      ? selectedGoal
      : selectedGoal?.id || selectedGoal?.name || selectedGoal?.title;

  const data = questions[goalId] || questions["deep-sleep"];
  const goal = goalDetails[goalId] || goalDetails["deep-sleep"];
  const GoalIcon = goal.icon;

  useEffect(() => {
    setAnswer1("");
    setAnswer2("");
    setStatus("idle");
    setMessage("");
    setAnswers?.({ answer1: "", answer2: "" });
  }, [goalId, setAnswers]);

  const getGoalValue = () => {
    if (!selectedGoal) return "";

    if (typeof selectedGoal === "string") return selectedGoal;

    return (
      selectedGoal.title ||
      selectedGoal.name ||
      selectedGoal.id ||
      ""
    );
  };

  const handlePersonalize = async () => {
    if (!answer1 || !answer2) {
      setMessage("Please answer both questions before continuing.");
      return;
    }

    if (!isSignedIn || !userId) {
      setMessage("Please sign in to save your wellness preferences.");
      return;
    }

    const goalValue = getGoalValue();

    if (!goalValue) {
      setMessage("Please select a wellness goal first.");
      return;
    }

    try {
      setStatus("analyzing");
      setMessage("");

      const token = await getToken();

      const response = await fetch("https://ayurai-backend-u1e8.onrender.com/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          clerkId: userId,
          goal: goalValue,
          answer1,
          answer2,
        }),
      });

      let result = {};

      try {
        result = await response.json();
      } catch {
        // The server may return an empty response.
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            `Unable to save preferences (${response.status}).`
        );
      }

      setAnswers?.({ answer1, answer2 });
      setStatus("complete");
    } catch (error) {
      console.error("Personalization save error:", error);
      setMessage(
        error?.message ||
          "Couldn't save your preferences. Please try again."
      );
      setStatus("idle");
    }
  };

  const handleAdjustAnswers = () => {
    setStatus("idle");
    setMessage("");
  };

  const handleLoginClick = () => {
    if (typeof openSignIn === "function") {
      openSignIn();
    }
  };

  return (
    <section
      id="ai-wellness"
      className="scroll-mt-24 bg-[#f7f3e9] px-5 py-14 sm:px-8 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#6c8968]">
              <Sparkles size={15} />
              AI Wellness
            </p>

            <h2 className="font-serif text-3xl font-semibold leading-tight text-[#173f2c] sm:text-4xl">
              Get Your Personalized Plan
            </h2>

            <p className="mt-3 max-w-xl text-base leading-7 text-[#687365]">
              Answer a few questions and let AyurAI help shape a routine around
              your wellness goal and preferences.
            </p>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-2xl border border-[#e5e7d8] bg-white/75 px-4 py-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e7efdf] text-[#24633f]">
              <GoalIcon size={23} />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#7b8774]">
                Selected focus
              </p>
              <p className="mt-1 text-base font-semibold text-[#21432d]">
                {goal.name}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-3xl border border-[#e8e1d3] bg-[#fffdf8] shadow-[0_12px_40px_rgba(49,65,40,0.06)]"
        >
          <div className="grid lg:grid-cols-[0.8fr_1.7fr]">
            <div className="relative overflow-hidden bg-[#eaf0e2] p-6 sm:p-8 lg:p-9">
              <div className="pointer-events-none absolute -bottom-12 -left-10 h-48 w-48 rounded-full bg-[#d3e1c8]/70 blur-2xl" />

              <div className="relative">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#23633f] shadow-sm">
                  <Sparkles size={26} />
                </span>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#64805d]">
                  Your wellness journey
                </p>

                <h3 className="mt-3 font-serif text-2xl font-semibold leading-snug text-[#1d452f] sm:text-3xl">
                  {data.title}
                </h3>

                <p className="mt-4 text-base leading-7 text-[#5c7058]">
                  {data.subtitle}
                </p>

                <div className="my-7 h-px bg-[#d6e1ce]" />

                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#276543]">
                      <CheckCircle2 size={17} />
                    </span>
                    <div>
                      <p className="text-base font-semibold text-[#2b4b34]">
                        Personal preferences
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#6c7a64]">
                        Tell us what suits your everyday lifestyle.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#276543]">
                      <Leaf size={17} />
                    </span>
                    <div>
                      <p className="text-base font-semibold text-[#2b4b34]">
                        Ayurveda-inspired guidance
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#6c7a64]">
                        Explore mindful habits for a balanced routine.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-white/80 bg-white/65 p-4">
                  <div className="flex items-center gap-2 text-[#466648]">
                    <ShieldCheck size={19} />
                    <span className="text-sm font-semibold">
                      Your wellness preferences
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#71806a]">
                    Your answers help personalize your experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-8 lg:p-9">
              <AnimatePresence mode="wait">
                {status === "analyzing" && (
                  <motion.div
                    key="saving"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-[400px] flex-col items-center justify-center text-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f0e1] text-[#21603d]"
                    >
                      <Leaf size={30} />
                    </motion.div>

                    <h3 className="mt-6 font-serif text-2xl font-semibold text-[#173f2c]">
                      Saving your preferences...
                    </h3>

                    <p className="mt-3 max-w-sm text-base leading-7 text-[#687365]">
                      AyurAI is saving your answers.
                    </p>
                  </motion.div>
                )}

                {status === "complete" && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex min-h-[400px] flex-col items-center justify-center text-center"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f1e1] text-[#21603d]">
                      <CheckCircle2 size={36} />
                    </span>

                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#718b68]">
                      Preferences saved
                    </p>

                    <h3 className="mt-3 font-serif text-3xl font-semibold text-[#173f2c]">
                      Your journey is ready
                    </h3>

                    <p className="mt-4 max-w-md text-base leading-7 text-[#687365]">
                      Your answers have been saved successfully. You can now
                      continue to your personalized routine.
                    </p>

                    <button
                      type="button"
                      onClick={handleAdjustAnswers}
                      className="mt-7 rounded-full border border-[#d6dfcf] bg-white px-6 py-3 text-base font-semibold text-[#24543a] transition hover:bg-[#f1f5eb]"
                    >
                      Review My Answers
                    </button>
                  </motion.div>
                )}

                {status === "idle" && (
                  <motion.div
                    key={`form-${goalId}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="mb-7 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#718b68]">
                          Personalization questions
                        </p>
                        <h3 className="mt-2 font-serif text-2xl font-semibold text-[#21432d]">
                          Tell us about yourself
                        </h3>
                      </div>

                      <span className="shrink-0 rounded-full border border-[#e3e8da] bg-[#f4f6ed] px-3 py-2 text-xs font-semibold text-[#54724f]">
                        2 questions
                      </span>
                    </div>

                    {message && (
                      <div
                        role="alert"
                        className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-base text-red-700"
                      >
                        {message}
                      </div>
                    )}

                    <div>
                      <p className="mb-4 text-base font-semibold text-[#294631]">
                        <span className="mr-2 text-[#78916c]">01</span>
                        {data.question1.label}
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {data.question1.options.map((option) => {
                          const selected = answer1 === option;

                          return (
                            <button
                              type="button"
                              key={option}
                              aria-pressed={selected}
                              onClick={() => setAnswer1(option)}
                              className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-base transition ${
                                selected
                                  ? "border-[#286344] bg-[#edf4e8] font-semibold text-[#204b31] ring-1 ring-[#286344]/20"
                                  : "border-[#e7e3d8] bg-white text-[#596557] hover:border-[#b7c9ac] hover:bg-[#fafbf6]"
                              }`}
                            >
                              <span>{option}</span>
                              {selected && (
                                <CheckCircle2
                                  size={19}
                                  className="shrink-0 text-[#286344]"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-8">
                      <p className="mb-4 text-base font-semibold text-[#294631]">
                        <span className="mr-2 text-[#78916c]">02</span>
                        {data.question2.label}
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {data.question2.options.map((option) => {
                          const selected = answer2 === option;

                          return (
                            <button
                              type="button"
                              key={option}
                              aria-pressed={selected}
                              onClick={() => setAnswer2(option)}
                              className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-base transition ${
                                selected
                                  ? "border-[#286344] bg-[#edf4e8] font-semibold text-[#204b31] ring-1 ring-[#286344]/20"
                                  : "border-[#e7e3d8] bg-white text-[#596557] hover:border-[#b7c9ac] hover:bg-[#fafbf6]"
                              }`}
                            >
                              <span>{option}</span>
                              {selected && (
                                <CheckCircle2
                                  size={19}
                                  className="shrink-0 text-[#286344]"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-8 border-t border-[#ece7db] pt-6">
                      {!isSignedIn ? (
                        <SignInButton mode="modal">
                          <button
                            type="button"
                            disabled={!answer1 || !answer2}
                            className={`flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-base font-semibold transition sm:w-auto ${
                              answer1 && answer2
                                ? "bg-[#155438] text-white shadow-md hover:bg-[#0e422b]"
                                : "cursor-not-allowed bg-[#e8e8df] text-[#9a9e91]"
                            }`}
                          >
                            <Sparkles size={19} />
                            Sign In to Personalize
                            <ArrowRight size={19} />
                          </button>
                        </SignInButton>
                      ) : (
                        <button
                          type="button"
                          disabled={!answer1 || !answer2}
                          onClick={handlePersonalize}
                          className={`flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-base font-semibold transition sm:w-auto ${
                            answer1 && answer2
                              ? "bg-[#155438] text-white shadow-md hover:bg-[#0e422b]"
                              : "cursor-not-allowed bg-[#e8e8df] text-[#9a9e91]"
                          }`}
                        >
                          <Sparkles size={19} />
                          Personalize My Journey
                          <ArrowRight size={19} />
                        </button>
                      )}

                      <p className="mt-4 text-sm leading-6 text-[#818678]">
                        {!isSignedIn
                          ? "Choose both answers, then sign in to save your preferences."
                          : "Your preferences will be saved to your AyurAI account."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-6 text-[#85877c]">
          AyurAI provides wellness and educational guidance inspired by
          Ayurveda. It is not a medical diagnosis or a substitute for
          professional medical advice.
        </p>
      </div>
    </section>
  );
}

export default AIPersonalization;
