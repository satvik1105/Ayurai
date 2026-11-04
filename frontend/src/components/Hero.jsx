
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Leaf,
  Sparkles,
  Heart,
  ShieldCheck,
  Utensils,
  Check,
  Moon,
  Brain,
  Activity,
} from "lucide-react";

const heroData = {
  "deep-sleep": {
    badge: "AI-POWERED SLEEP WELLNESS",
    title: "Sleep Better.",
    highlight: "Live Brighter.",
    description:
      "Build calming bedtime routines inspired by Ayurveda for deeper rest and balanced days.",
    button: "Build My Sleep Plan",
  },
  "glowing-skin": {
    badge: "AI-POWERED SKIN WELLNESS",
    title: "Natural Glow.",
    highlight: "Healthy You.",
    description:
      "Discover mindful Ayurvedic habits that support healthy skin and everyday confidence.",
    button: "Build My Skin Plan",
  },
  "stress-relief": {
    badge: "AI-POWERED STRESS WELLNESS",
    title: "Find Your Calm.",
    highlight: "Feel Like You.",
    description:
      "Create mindful routines inspired by Ayurveda to bring more calm and balance into your day.",
    button: "Build My Calm Plan",
  },
  "energy-focus": {
    badge: "AI-POWERED ENERGY WELLNESS",
    title: "More Energy.",
    highlight: "Clearer Focus.",
    description:
      "Build balanced daily habits inspired by Ayurveda to support your energy and focus.",
    button: "Build My Energy Plan",
  },
  "joint-care": {
    badge: "AI-POWERED JOINT WELLNESS",
    title: "Move With Ease.",
    highlight: "Feel Balanced.",
    description:
      "Explore gentle, mindful routines inspired by Ayurveda for a more balanced lifestyle.",
    button: "Build My Wellness Plan",
  },
  "digestive-wellness": {
    badge: "AI-POWERED DIGESTIVE WELLNESS",
    title: "A Happier Gut.",
    highlight: "A Healthier You.",
    description:
      "Build mindful daily routines inspired by Ayurveda to support digestive wellness and healthy habits.",
    button: "Build My Digestive Plan",
  },
};

const fallbackData = heroData["digestive-wellness"];

const storageKeys = {
  goal: "AyurAI_selectedGoal_",
  diet: "AyurAI_diet_",
  experience: "AyurAI_experience_",
};

const goals = [
  { id: "deep-sleep", emoji: "😴", title: "Deep Sleep" },
  { id: "glowing-skin", emoji: "✨", title: "Glowing Skin" },
  { id: "stress-relief", emoji: "🧘", title: "Stress Relief" },
  { id: "energy-focus", emoji: "⚡", title: "Energy & Focus" },
  { id: "joint-care", emoji: "🦵", title: "Knee & Joint Care" },
  {
    id: "digestive-wellness",
    emoji: "🌿",
    title: "Digestive Wellness",
  },
];

function getGoalId(goal) {
  if (!goal) return "digestive-wellness";
  if (typeof goal === "string") return goal;

  const value = goal.id || goal.value || goal.title || goal.name;

  const match = goals.find(
    (item) =>
      item.id === value ||
      item.title.toLowerCase() === String(value || "").toLowerCase()
  );

  return match?.id || value || "digestive-wellness";
}

export default function Hero({
  selectedGoal,
  setSelectedGoal,
  onAskAyurAI,
}) {
  const { user, isLoaded } = useUser();
  const shouldReduceMotion = useReducedMotion();
  const userId = user?.id;

  const [diet, setDiet] = useState("Vegetarian");
  const [experience, setExperience] = useState("Beginner");

  const activeGoal = getGoalId(selectedGoal);
  const current = heroData[activeGoal] || fallbackData;

  useEffect(() => {
    if (!isLoaded || !userId) return;

    try {
      const savedGoal = localStorage.getItem(
        storageKeys.goal + userId
      );
      const savedDiet = localStorage.getItem(
        storageKeys.diet + userId
      );
      const savedExperience = localStorage.getItem(
        storageKeys.experience + userId
      );

      if (savedGoal && setSelectedGoal) {
        setSelectedGoal(savedGoal);
      }

      if (savedDiet) setDiet(savedDiet);
      if (savedExperience) setExperience(savedExperience);
    } catch (error) {
      console.error("Unable to load AyurAI preferences:", error);
    }
  }, [isLoaded, userId, setSelectedGoal]);

  useEffect(() => {
    if (!userId) return;

    try {
      localStorage.setItem(storageKeys.goal + userId, activeGoal);
      localStorage.setItem(storageKeys.diet + userId, diet);
      localStorage.setItem(
        storageKeys.experience + userId,
        experience
      );
    } catch (error) {
      console.error("Unable to save AyurAI preferences:", error);
    }
  }, [userId, activeGoal, diet, experience]);

  const chooseGoal = (goalId) => {
    if (setSelectedGoal) setSelectedGoal(goalId);
  };

  const scrollToPlan = () => {
    document.getElementById("ai-wellness")?.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <section
      id="home"
      className="relative isolate overflow-hidden bg-[#f3ebdd] text-[#173f2c]"
    >
      <div className="absolute inset-0 -z-20">
        <img
          src="/images/ayurai-herbal-hero.png"
          alt=""
          className="h-full w-full object-cover object-[65%_center]"
        />
      </div>

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#fff8e9]/75 via-[#fff8e9]/35 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-[#f3ebdd]/25" />

      <div className="mx-auto max-w-[1500px] px-5 pb-8 pt-5 sm:px-8 lg:px-12">
        <div className="grid min-h-[510px] items-center gap-8 lg:min-h-[510px] lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="relative z-10 max-w-[650px] py-8"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d9dfc9] bg-[#fffdf5]/85 px-4 py-2.5 shadow-sm backdrop-blur-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e4ecd9] text-[#17613e]">
                <Sparkles size={16} />
              </span>
              <span className="text-xs font-bold tracking-[0.16em] text-[#42624a] sm:text-sm">
                {current.badge}
              </span>
            </div>

            <h1 className="max-w-[680px] font-serif text-[clamp(3.1rem,6.1vw,5.6rem)] font-medium leading-[0.98] tracking-[-0.055em] text-[#153e2b]">
              {current.title}
              <br />
              <span className="italic text-[#176541]">
                {current.highlight}
              </span>
            </h1>

            <p className="mt-7 max-w-[550px] rounded-2xl bg-[#fff8ec]/45 px-1 py-1 text-base leading-8 text-[#304c3c] sm:text-lg">
              {current.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={scrollToPlan}
                className="inline-flex min-h-[48px] items-center gap-3 rounded-full bg-[#00613d] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#173f2c]/15 transition hover:-translate-y-0.5 hover:bg-[#064c33]"
              >
                {current.button}
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={onAskAyurAI}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-[#9caf96] bg-[#fffdf6]/85 px-6 py-3 text-sm font-medium text-[#244d35] shadow-sm backdrop-blur-sm transition hover:bg-white"
              >
                <Sparkles size={17} />
                Ask AyurAI
              </button>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-[#315540]">
              <span className="inline-flex items-center gap-2">
                <Leaf size={16} className="text-[#176541]" />
                Ayurveda Inspired
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles size={16} className="text-[#a77816]" />
                AI Personalized
              </span>
              <span className="inline-flex items-center gap-2">
                <Heart size={16} className="text-[#176541]" />
                Wellness Focused
              </span>
            </div>
          </motion.div>

          <div className="relative mx-auto hidden h-[420px] w-full max-w-[620px] lg:block">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="absolute right-[8%] top-[9%] w-[min(350px,78%)] rounded-[30px] border border-white/65 bg-[#fffdf5]/45 p-6 shadow-[0_20px_60px_rgba(32,54,35,0.12)] backdrop-blur-[5px]"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[#6c8064]/15 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5efdf]/85 text-[#176541]">
                    <Leaf size={23} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#657765]">
                      YOUR WELLNESS
                    </p>
                    <p className="text-sm font-bold text-[#294d35]">
                      Personalized for you
                    </p>
                  </div>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e3efdc]/90 text-[#276c43]">
                  <Check size={18} />
                </span>
              </div>

              <div className="pt-5">
                <p className="text-xs font-bold tracking-[0.15em] text-[#70806b]">
                  YOUR SELECTED FOCUS
                </p>
                <h2 className="mt-2 font-serif text-[25px] leading-tight text-[#19462f]">
                  {current.title} {current.highlight}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#526a57]">
                  Small, mindful habits can help you build a consistent
                  wellness routine.
                </p>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/40 bg-[#e9f0df]/55 p-3 backdrop-blur-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#176541]">
                  <Sparkles size={19} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#35583e]">
                    AyurAI Wellness Guide
                  </p>
                  <p className="text-xs leading-5 text-[#6b7b68]">
                    Inspired by your preferences
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={shouldReduceMotion ? undefined : { y: [0, -7, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-[1%] top-[13%] z-10 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/65 px-4 py-3 shadow-lg backdrop-blur-[6px]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6e9c9]/90 text-[#946d1d]">
                <Moon size={19} />
              </span>
              <div>
                <p className="text-xs text-[#738071]">Mindful living</p>
                <p className="text-sm font-bold text-[#34523a]">
                  Daily balance
                </p>
              </div>
            </motion.div>

            <motion.div
              animate={shouldReduceMotion ? undefined : { y: [0, 7, 0] }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute right-0 top-[67%] z-10 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/65 px-4 py-3 shadow-lg backdrop-blur-[6px]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4efdf]/90 text-[#176541]">
                <Brain size={19} />
              </span>
              <div>
                <p className="text-xs text-[#71806f]">Your wellness focus</p>
                <p className="text-sm font-bold text-[#34523a]">
                  {goals.find((goal) => goal.id === activeGoal)?.title ||
                    "Personal Wellness"}
                </p>
              </div>
            </motion.div>

            <div className="absolute bottom-[4%] left-[28%] z-10 inline-flex items-center gap-2 rounded-full border border-white/60 bg-[#fffdf1]/70 px-4 py-2 text-xs font-medium text-[#47644b] shadow-md backdrop-blur-[5px]">
              <Activity size={15} />
              Your journey, your pace
            </div>
          </div>
        </div>

        <div className="relative z-20 -mt-1 rounded-[28px] border border-white/80 bg-[#fffdf7]/95 p-5 shadow-[0_20px_60px_rgba(52,58,36,0.12)] backdrop-blur-md sm:p-7">
          <div className="mb-5 flex items-center justify-center gap-3 text-center text-xs font-bold tracking-[0.24em] text-[#4b6950] sm:text-sm">
            <Leaf size={18} className="text-[#76916c]" />
            CHOOSE YOUR WELLNESS GOAL
            <Leaf size={18} className="rotate-180 text-[#76916c]" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {goals.map((goal) => {
              const isSelected = activeGoal === goal.id;

              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => chooseGoal(goal.id)}
                  aria-pressed={isSelected}
                  className={`relative flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center transition duration-200 hover:-translate-y-0.5 ${
                    isSelected
                      ? "border-[#08613f] bg-[#08613f] text-white shadow-lg shadow-[#08613f]/15"
                      : "border-[#e7e3d6] bg-white/85 text-[#405644] hover:border-[#a9bea0] hover:bg-white"
                  }`}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {goal.emoji}
                  </span>
                  <span className="text-xs font-semibold sm:text-[13px]">
                    {goal.title}
                  </span>
                  {isSelected && (
                    <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[#08613f]">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="my-5 border-t border-[#e7e2d5]" />

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#425a46]">
                <Utensils size={16} className="text-[#6e8a5d]" />
                What is your current diet?
              </span>
              <select
                value={diet}
                onChange={(event) => setDiet(event.target.value)}
                className="min-h-[48px] w-full rounded-xl border border-[#dedfce] bg-white/90 px-4 text-sm text-[#465748] outline-none transition focus:border-[#729776] focus:ring-2 focus:ring-[#729776]/20"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Eggetarian">Eggetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#425a46]">
                <Leaf size={16} className="text-[#6e8a5d]" />
                What is your experience with Ayurveda?
              </span>
              <select
                value={experience}
                onChange={(event) => setExperience(event.target.value)}
                className="min-h-[48px] w-full rounded-xl border border-[#dedfce] bg-white/90 px-4 text-sm text-[#465748] outline-none transition focus:border-[#729776] focus:ring-2 focus:ring-[#729776]/20"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Experienced">Experienced</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-[#71816c]">
            <ShieldCheck size={15} />
            Your wellness preferences help personalize your experience.
          </div>
        </div>
      </div>
    </section>
  );
}
