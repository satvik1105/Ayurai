
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock3,
  Sparkles,
  BookOpen,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

const journeyData = {
  "deep-sleep": {
    title: "Your Personalized Sleep Journey",
    subtitle: "A calmer evening, built around your routine.",
    steps: [
      { icon: "🌙", title: "Wind Down", time: "9:30 PM", text: "Reduce screen stimulation and begin your evening wind-down." },
      { icon: "🍵", title: "Evening Ritual", time: "10:00 PM", text: "Create a relaxing herbal-inspired evening ritual." },
      { icon: "🧘", title: "Relaxation", time: "10:30 PM", text: "Try gentle breathing or a quiet relaxation activity." },
      { icon: "😴", title: "Sleep Preparation", time: "11:00 PM", text: "Prepare your environment for a consistent bedtime." },
    ],
    progressTitle: "Sleep Consistency",
  },
  "glowing-skin": {
    title: "Your Personalized Skin Journey",
    subtitle: "Simple Ayurvedic-inspired habits for your skin goals.",
    steps: [
      { icon: "🌅", title: "Morning Routine", time: "8:00 AM", text: "Start your day with a simple personalized skincare routine." },
      { icon: "🌿", title: "Skin Ritual", time: "10:00 AM", text: "Follow the routine selected for your skin preferences." },
      { icon: "💧", title: "Hydration", time: "1:00 PM", text: "Keep hydration and healthy daily habits consistent." },
      { icon: "🌙", title: "Evening Care", time: "9:00 PM", text: "Complete your evening skincare and wind-down routine." },
    ],
    progressTitle: "Skin Routine Consistency",
  },
  "stress-relief": {
    title: "Your Personalized Stress Journey",
    subtitle: "Build small calming habits into your everyday routine.",
    steps: [
      { icon: "🌅", title: "Morning Reset", time: "7:30 AM", text: "Begin your day with a few minutes of mindful breathing." },
      { icon: "🧘", title: "Mindful Pause", time: "12:30 PM", text: "Take a short break and reset your attention." },
      { icon: "🌿", title: "Evening Calm", time: "7:00 PM", text: "Create a calmer transition from work or study." },
      { icon: "🌙", title: "Digital Wind Down", time: "10:00 PM", text: "Reduce stimulation and prepare for restful sleep." },
    ],
    progressTitle: "Calm Routine Consistency",
  },
  "energy-focus": {
    title: "Your Personalized Energy Journey",
    subtitle: "Build healthier habits for everyday energy and focus.",
    steps: [
      { icon: "☀️", title: "Morning Start", time: "7:00 AM", text: "Start the day with a consistent morning wellness routine." },
      { icon: "⚡", title: "Focus Block", time: "10:00 AM", text: "Create a distraction-free period for focused work or study." },
      { icon: "🚶", title: "Movement Break", time: "3:00 PM", text: "Add light movement to break up long periods of sitting." },
      { icon: "🌙", title: "Evening Reset", time: "9:30 PM", text: "Wind down so your next day starts with better consistency." },
    ],
    progressTitle: "Energy Habit Consistency",
  },
  "joint-care": {
    title: "Your Personalized Joint Care Journey",
    subtitle: "Support mobility with simple, consistent wellness habits.",
    steps: [
      { icon: "🌅", title: "Morning Mobility", time: "7:30 AM", text: "Begin with gentle mobility movements suited to your routine." },
      { icon: "🦵", title: "Movement Break", time: "11:00 AM", text: "Avoid prolonged inactivity with comfortable movement breaks." },
      { icon: "🚶", title: "Mobility Session", time: "5:30 PM", text: "Follow your personalized low-impact mobility routine." },
      { icon: "🌙", title: "Recovery Routine", time: "9:00 PM", text: "End your day with a relaxing recovery-focused routine." },
    ],
    progressTitle: "Mobility Consistency",
  },
  "digestive-wellness": {
    title: "Your Personalized Digestive Journey",
    subtitle: "Build mindful daily habits around digestive wellness.",
    steps: [
      { icon: "🌅", title: "Morning Routine", time: "7:30 AM", text: "Start your morning with a consistent wellness routine." },
      { icon: "🥗", title: "Mindful Meals", time: "1:00 PM", text: "Build consistency around balanced and mindful eating habits." },
      { icon: "🚶", title: "After-Meal Movement", time: "2:00 PM", text: "Add comfortable movement to your daily routine." },
      { icon: "🌙", title: "Evening Routine", time: "8:30 PM", text: "Keep your evening routine calm and consistent." },
    ],
    progressTitle: "Routine Consistency",
  },
};

function PersonalizedJourney({ selectedGoal }) {
  const data = journeyData[selectedGoal] || journeyData["deep-sleep"];

  const today = new Date().toLocaleDateString("en-CA");
  const storageKey = `ayurAI_progress_${selectedGoal}_${today}`;

  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setCompleted(Array.isArray(saved) ? saved : []);
    } catch {
      setCompleted([]);
    }
  }, [storageKey]);

  const toggleTask = (index) => {
    setCompleted((previous) => {
      const next = previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index];

      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  const progress = Math.round(
    (completed.length / data.steps.length) * 100
  );

  return (
    <section className="bg-[#f6f3ea] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          key={selectedGoal}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-green-700">
            <Sparkles size={16} />
            Personalized for you
          </div>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-green-950 sm:text-5xl">
            {data.title}
          </h2>
          <p className="mt-4 text-lg text-gray-600">{data.subtitle}</p>
        </motion.div>

        <motion.div
          key={`journey-${selectedGoal}`}
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 grid gap-8 rounded-[2rem] border border-white/80 bg-white/75 p-6 shadow-xl backdrop-blur-xl lg:grid-cols-[1fr_280px] lg:p-8"
        >
          <div>
            <div className="mb-7 flex items-center gap-2">
              <Clock3 size={20} className="text-green-700" />
              <h3 className="text-xl font-semibold text-green-950">
                Your Daily Routine
              </h3>
            </div>

            <div className="space-y-4">
              {data.steps.map((step, index) => {
                const isDone = completed.includes(index);

                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex gap-4 rounded-2xl border bg-white p-4 shadow-sm ${
                      isDone ? "border-green-300" : "border-gray-100"
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-2xl">
                      {step.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className={`font-semibold ${isDone ? "text-green-700 line-through" : "text-green-950"}`}>
                          {step.title}
                        </h4>
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          {step.time}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {step.text}
                      </p>
                      <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-green-800">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleTask(index)}
                          className="h-4 w-4 accent-green-800"
                        />
                        {isDone ? "Completed" : "Mark as done"}
                      </label>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-green-950 p-5 text-white">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} />
                <p className="text-sm font-medium">Your Progress</p>
              </div>

              <div className="mt-5 flex items-end justify-between">
                <span className="text-4xl font-semibold">{progress}%</span>
                <span className="text-xs text-green-200">Today</span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
                <motion.div
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full rounded-full bg-white"
                />
              </div>

              <p className="mt-3 text-xs text-green-100">
                {data.progressTitle}
              </p>
              <p className="mt-2 text-xs text-green-200">
                {completed.length} of {data.steps.length} tasks completed
              </p>
            </div>

            <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-green-700" />
                <p className="font-semibold text-green-950">AyurAI Insight</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Mark each habit when you complete it. Your progress reflects
                the tasks you check off today.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-green-900 transition hover:bg-green-50">
                <BookOpen size={16} />
                Learn
              </button>
              <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-green-900 transition hover:bg-green-50">
                <ShoppingBag size={16} />
                Products
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default PersonalizedJourney;
