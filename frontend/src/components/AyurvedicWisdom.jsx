import { motion } from "framer-motion";
import {
  Sparkles,
  Leaf,
  Moon,
  Coffee,
  Wind,
  Sun,
  Droplets,
  Brain,
  HeartPulse,
} from "lucide-react";

const wisdomData = {
  "deep-sleep": {
    badge: "Sleep & Ayurveda",
    title: "A calmer evening can support better rest.",
    description:
      "Ayurvedic wellness traditions emphasize creating a gentle transition from an active day toward a calm evening.",
    dosha: "Vata-inspired evening care",
    practices: [
      {
        icon: Moon,
        title: "Consistent bedtime",
        text: "Keep your sleep and wake times as consistent as possible.",
      },
      {
        icon: Coffee,
        title: "Warm evening ritual",
        text: "Create a simple caffeine-free ritual that signals the day is slowing down.",
      },
      {
        icon: Wind,
        title: "Slow breathing",
        text: "Spend a few quiet minutes with slow and comfortable breathing.",
      },
      {
        icon: Brain,
        title: "Reduce stimulation",
        text: "Give your mind a gradual transition away from intense work and screens.",
      },
    ],
    why:
      "Your responses suggest that your evening routine could benefit from a more gradual wind-down and greater consistency.",
  },

  "glowing-skin": {
    badge: "Skin Wellness & Ayurveda",
    title: "Healthy-looking skin starts with consistent habits.",
    description:
      "Ayurvedic wellness approaches traditionally place emphasis on balanced daily routines, nourishment and mindful self-care.",
    dosha: "Balanced daily self-care",
    practices: [
      {
        icon: Droplets,
        title: "Stay hydrated",
        text: "Build a consistent hydration habit throughout the day.",
      },
      {
        icon: Leaf,
        title: "Gentle self-care",
        text: "Keep your personal care routine simple and consistent.",
      },
      {
        icon: Sun,
        title: "Morning routine",
        text: "Start the day with a calm and consistent self-care ritual.",
      },
      {
        icon: HeartPulse,
        title: "Support your routine",
        text: "Prioritize sleep, balanced meals and regular daily habits.",
      },
    ],
    why:
      "Your selected goal indicates that consistency and a balanced daily routine are useful areas to focus on.",
  },

  "stress-relief": {
    badge: "Mind & Balance",
    title: "Create small moments of calm throughout your day.",
    description:
      "Ayurvedic wellness traditions often emphasize rhythm, mindful routines and creating space for relaxation.",
    dosha: "Grounding daily rhythm",
    practices: [
      {
        icon: Wind,
        title: "Breathing pause",
        text: "Take short pauses during the day for slow, comfortable breathing.",
      },
      {
        icon: Leaf,
        title: "Nature break",
        text: "Create a small break from screens and spend a few quiet moments outdoors when possible.",
      },
      {
        icon: Moon,
        title: "Evening slowdown",
        text: "Gradually reduce stimulation as your day comes to an end.",
      },
      {
        icon: HeartPulse,
        title: "Regular rhythm",
        text: "Keep your everyday routine reasonably consistent.",
      },
    ],
    why:
      "Your selected goal suggests that building small, repeatable moments of calm may fit naturally into your routine.",
  },

  "energy-focus": {
    badge: "Energy & Focus",
    title: "Build your energy around rhythm, movement and focus.",
    description:
      "A consistent daily rhythm can help create clearer transitions between work, movement and recovery.",
    dosha: "Balanced daily rhythm",
    practices: [
      {
        icon: Sun,
        title: "Morning activation",
        text: "Start your day with a consistent morning routine and some gentle movement.",
      },
      {
        icon: Brain,
        title: "Focused work",
        text: "Protect distraction-free periods for your most important tasks.",
      },
      {
        icon: Wind,
        title: "Movement breaks",
        text: "Take short breaks instead of remaining in one position for extended periods.",
      },
      {
        icon: Moon,
        title: "Evening reset",
        text: "Create a clear transition from productivity into recovery.",
      },
    ],
    why:
      "Your selected goal points toward creating a better balance between focused activity and recovery.",
  },

  "joint-care": {
    badge: "Joint Wellness",
    title: "Gentle, consistent movement can become part of your daily rhythm.",
    description:
      "For general wellness, Ayurveda-inspired routines often emphasize gentle movement, warmth and consistency.",
    dosha: "Gentle movement routine",
    practices: [
      {
        icon: Wind,
        title: "Gentle mobility",
        text: "Begin with comfortable movements rather than sudden or intense activity.",
      },
      {
        icon: Sun,
        title: "Morning movement",
        text: "A consistent morning mobility routine can help establish a daily movement habit.",
      },
      {
        icon: Leaf,
        title: "Movement breaks",
        text: "Break up long periods of sitting with short, comfortable movement.",
      },
      {
        icon: Moon,
        title: "Evening recovery",
        text: "End the day with a calm recovery-focused routine.",
      },
    ],
    why:
      "Your selected goal suggests that consistency and comfortable movement are useful areas to prioritize.",
  },

  "digestive-wellness": {
    badge: "Digestive Wellness",
    title: "Mindful meals and a consistent rhythm matter.",
    description:
      "Ayurvedic traditions have long emphasized mindful eating, regular routines and attention to digestion.",
    dosha: "Mindful eating rhythm",
    practices: [
      {
        icon: Leaf,
        title: "Mindful meals",
        text: "Slow down and stay present while eating.",
      },
      {
        icon: Sun,
        title: "Regular meal rhythm",
        text: "Try to maintain a reasonably consistent meal routine.",
      },
      {
        icon: Wind,
        title: "Gentle movement",
        text: "A comfortable walk can be a simple way to add movement to your daily routine.",
      },
      {
        icon: Droplets,
        title: "Hydration habit",
        text: "Maintain a consistent hydration routine throughout the day.",
      },
    ],
    why:
      "Your selected goal suggests that meal consistency, mindful eating and everyday movement are useful areas to explore.",
  },
};

function AyurvedicWisdom({ selectedGoal }) {
  const currentGoal = selectedGoal || "deep-sleep";
  const data = wisdomData[currentGoal];

  return (
    <section className="bg-[#f6f3ea] px-6 py-8">
      <div className="mx-auto max-w-6xl">

        {/* Section Header */}
        <motion.div
          key={currentGoal}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/70 px-4 py-2 text-sm font-medium text-green-700 shadow-sm">
            <Leaf size={16} />
            {data.badge}
          </div>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-green-950 sm:text-5xl">
            {data.title}
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            {data.description}
          </p>
        </motion.div>

        {/* Main Wisdom Card */}
        <motion.div
          key={`main-${currentGoal}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-7 max-w-5xl overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-xl"
        >
          <div className="grid lg:grid-cols-[0.8fr_1.2fr]">

            {/* Left */}
            <div className="relative overflow-hidden bg-green-950 p-8 text-white sm:p-10">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-green-800/40 blur-3xl" />

              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <Sparkles size={25} />
                </div>

                <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-green-200">
                  Ayurvedic Perspective
                </p>

                <h3 className="mt-3 text-3xl font-semibold">
                  {data.dosha}
                </h3>

                <p className="mt-4 leading-7 text-white/75">
                  This section provides general wellness information
                  inspired by Ayurvedic traditions. It is not a
                  medical diagnosis or treatment recommendation.
                </p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-medium text-green-200">
                    Why this recommendation?
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/80">
                    {data.why}
                  </p>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="p-8 sm:p-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">
                    Recommended practices
                  </p>

                  <h3 className="mt-1 text-2xl font-semibold text-green-950">
                    Small habits, repeated consistently.
                  </h3>
                </div>

                <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-green-50 sm:flex">
                  🌿
                </div>
              </div>

              {/* Practices */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {data.practices.map((practice, index) => {
                  const Icon = practice.icon;

                  return (
                    <motion.div
                      key={`${currentGoal}-${index}`}
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.1,
                      }}
                      whileHover={{
                        y: -4,
                      }}
                      className="rounded-2xl border border-green-100 bg-[#f8faf5] p-5 transition-shadow hover:shadow-md"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                        <Icon size={20} />
                      </div>

                      <h4 className="mt-4 font-semibold text-green-950">
                        {practice.title}
                      </h4>

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {practice.text}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </div>
        </motion.div>

        {/* AI-style Insight */}
        <motion.div
          key={`insight-${currentGoal}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-5xl rounded-3xl border border-green-200 bg-green-50 p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-white">
              🤖
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">
                AyurAI Personal Insight
              </p>

              <p className="mt-1 text-sm leading-6 text-green-950/75">
                Your recommendations are adapted to your selected
                wellness goal. As we connect the AI backend, this
                section will be generated dynamically from your
                answers and Ayurvedic knowledge base.
              </p>
            </div>

            <div className="rounded-full bg-white px-4 py-2 text-xs font-medium text-green-700 shadow-sm">
              AI Ready
            </div>
          </div>
        </motion.div>

        <p className="mx-auto mt-4 max-w-2xl text-center text-xs leading-5 text-gray-500">
          AyurAI provides general wellness and educational information.
          It does not diagnose, treat, cure or prevent medical conditions.
        </p>

      </div>
    </section>
  );
}

export default AyurvedicWisdom;