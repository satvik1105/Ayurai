import { motion } from "framer-motion";
import {
  Sparkles,
  Moon,
  Sun,
  Brain,
  Activity,
  Leaf,
} from "lucide-react";

const insightData = {
  "deep-sleep": {
    icon: Moon,
    label: "Sleep Insight",

    default: {
      title: "Build a calmer evening routine.",
      description:
        "Your personalized journey can focus on creating a consistent wind-down routine and reducing late-evening stimulation.",
      focus: [
        "Create a consistent wind-down time",
        "Reduce screen stimulation before bed",
        "Add a short relaxation activity",
      ],
      score: 82,
    },

    answers: {
      "Can't fall asleep": {
        title: "Let's make falling asleep easier.",
        description:
          "Since falling asleep is your main challenge, your routine should focus on reducing stimulation, creating a predictable bedtime and adding a short calming ritual.",
        focus: [
          "Keep the same wind-down time each night",
          "Reduce stimulating screens before bed",
          "Add 5–10 minutes of slow breathing",
        ],
        score: 88,
      },

      "Wake up frequently": {
        title: "Let's create a more stable sleep environment.",
        description:
          "Your responses suggest that consistency and a calmer nighttime environment should be key parts of your personalized sleep journey.",
        focus: [
          "Keep your sleep environment calm and comfortable",
          "Follow a consistent bedtime routine",
          "Avoid unnecessary stimulation late at night",
        ],
        score: 86,
      },

      "Wake up tired": {
        title: "Let's improve the quality of your wind-down.",
        description:
          "Your journey can focus on creating a stronger transition into sleep so your evening routine supports more restful nights.",
        focus: [
          "Create a consistent evening routine",
          "Give yourself enough time to wind down",
          "Keep late-evening activities calm",
        ],
        score: 85,
      },

      "Irregular sleep schedule": {
        title: "Consistency is your first sleep goal.",
        description:
          "Because your sleep schedule varies, your personalized journey should begin with a more predictable bedtime and wake-up rhythm.",
        focus: [
          "Choose a consistent bedtime window",
          "Create the same wind-down ritual",
          "Avoid large changes to your sleep schedule",
        ],
        score: 90,
      },
    },
  },

  "glowing-skin": {
    icon: Sparkles,
    label: "Skin Wellness Insight",

    default: {
      title: "Keep your skincare routine simple and consistent.",
      description:
        "Your personalized journey can focus on building sustainable skincare habits around your selected skin goals.",
      focus: [
        "Maintain a simple daily routine",
        "Focus on consistent hydration habits",
        "Track your routine regularly",
      ],
      score: 79,
    },

    answers: {
      Glow: {
        title: "Consistency is the foundation of your glow.",
        description:
          "Since your main goal is glow, your personalized journey should focus on simple, sustainable skincare and everyday wellness habits.",
        focus: [
          "Maintain a consistent skincare routine",
          "Build better hydration habits",
          "Track your routine consistently",
        ],
        score: 87,
      },

      Hydration: {
        title: "Let's focus on healthy hydration habits.",
        description:
          "Your selected goal suggests that hydration should be an important part of your daily wellness and skincare routine.",
        focus: [
          "Build a consistent hydration habit",
          "Keep your skincare routine simple",
          "Track your daily routine",
        ],
        score: 85,
      },

      "Skin texture": {
        title: "Let's build a consistent skin routine.",
        description:
          "Your journey can focus on maintaining simple and sustainable habits rather than constantly changing your routine.",
        focus: [
          "Keep your routine consistent",
          "Avoid unnecessary product changes",
          "Track your skin routine regularly",
        ],
        score: 84,
      },

      "Simple routine": {
        title: "Simple is better when consistency matters.",
        description:
          "Your goal is to build a routine that is easy to follow every day and sustainable over time.",
        focus: [
          "Keep your routine simple",
          "Build consistent daily habits",
          "Review your routine regularly",
        ],
        score: 90,
      },
    },
  },

  "stress-relief": {
    icon: Brain,
    label: "Calmness Insight",

    default: {
      title: "Small calming habits can shape your day.",
      description:
        "Your wellness journey can focus on adding short moments of relaxation throughout the day.",
      focus: [
        "Add short mindful pauses",
        "Practice a simple breathing routine",
        "Create an evening wind-down habit",
      ],
      score: 81,
    },

    answers: {
      Morning: {
        title: "Let's create a calmer start to your day.",
        description:
          "Since mornings feel more stressful, your routine can begin with a short period of calm before your daily responsibilities start.",
        focus: [
          "Start with a short mindful pause",
          "Avoid immediately rushing into tasks",
          "Use slow breathing before beginning your day",
        ],
        score: 86,
      },

      Afternoon: {
        title: "Let's add a reset to your afternoon.",
        description:
          "Your personalized routine can introduce a short reset during the afternoon to help create a smoother transition through the rest of your day.",
        focus: [
          "Take a short mindful break",
          "Step away from screens when possible",
          "Use a few slow breaths to reset",
        ],
        score: 85,
      },

      Evening: {
        title: "Let's make your evenings calmer.",
        description:
          "Because your stress is strongest in the evening, your routine can focus on creating a calmer transition away from daily responsibilities.",
        focus: [
          "Create an evening wind-down ritual",
          "Reduce unnecessary stimulation",
          "Add a short relaxation activity",
        ],
        score: 88,
      },

      "Throughout the day": {
        title: "Let's build small calming moments throughout your day.",
        description:
          "Since stress appears throughout the day, short and repeatable calming habits can become the foundation of your wellness journey.",
        focus: [
          "Take short mindful pauses",
          "Practice slow breathing regularly",
          "Create a consistent evening wind-down",
        ],
        score: 90,
      },
    },
  },

  "energy-focus": {
    icon: Sun,
    label: "Energy Insight",

    default: {
      title: "Build consistency around your daily energy.",
      description:
        "Your journey can focus on creating a structured routine with movement, focused work periods and better recovery habits.",
      focus: [
        "Create a consistent morning routine",
        "Add regular movement breaks",
        "Protect focused work or study periods",
      ],
      score: 80,
    },

    answers: {
      Morning: {
        title: "Let's strengthen your morning energy.",
        description:
          "Since your energy is lowest in the morning, your routine can focus on creating a consistent and gradual start to the day.",
        focus: [
          "Create a consistent morning routine",
          "Start the day with light movement",
          "Choose one clear morning priority",
        ],
        score: 86,
      },

      Afternoon: {
        title: "Let's protect your afternoon energy.",
        description:
          "Your personalized journey can use movement breaks and focused work periods to create a more balanced afternoon rhythm.",
        focus: [
          "Add a short afternoon movement break",
          "Protect focused work periods",
          "Avoid long uninterrupted sitting",
        ],
        score: 85,
      },

      Evening: {
        title: "Let's create a better evening reset.",
        description:
          "Your routine can focus on managing evening energy while creating a smoother transition into recovery.",
        focus: [
          "Create a consistent evening routine",
          "Reduce unnecessary stimulation",
          "Prepare your priorities for tomorrow",
        ],
        score: 84,
      },

      "It varies": {
        title: "Let's create a more predictable energy rhythm.",
        description:
          "Since your energy varies, consistency in sleep, movement and focused work periods can help create a more structured daily routine.",
        focus: [
          "Maintain a consistent daily rhythm",
          "Add regular movement breaks",
          "Protect focused work periods",
        ],
        score: 88,
      },
    },
  },

  "joint-care": {
    icon: Activity,
    label: "Mobility Wellness Insight",

    default: {
      title: "Consistency matters for your mobility routine.",
      description:
        "Your wellness journey can focus on comfortable movement, mobility habits and reducing long periods of inactivity.",
      focus: [
        "Add gentle mobility into your routine",
        "Take regular movement breaks",
        "Build consistent low-impact activity habits",
      ],
      score: 78,
    },

    answers: {
      Morning: {
        title: "Let's make your mornings more mobile.",
        description:
          "Since discomfort is more noticeable in the morning, your routine can begin with gentle and comfortable movement.",
        focus: [
          "Start with gentle morning mobility",
          "Avoid staying still for long periods",
          "Build a consistent movement habit",
        ],
        score: 85,
      },

      "After sitting": {
        title: "Let's break up long periods of sitting.",
        description:
          "Your routine can focus on regular movement breaks throughout periods of prolonged sitting.",
        focus: [
          "Take regular movement breaks",
          "Add gentle mobility between tasks",
          "Avoid staying in one position for too long",
        ],
        score: 87,
      },

      "After activity": {
        title: "Let's make recovery part of your routine.",
        description:
          "Since discomfort appears after activity, your wellness routine can emphasize comfortable movement and recovery habits.",
        focus: [
          "Use gentle mobility after activity",
          "Avoid suddenly increasing activity",
          "Build consistent recovery habits",
        ],
        score: 84,
      },

      "It varies": {
        title: "Let's build consistent everyday mobility.",
        description:
          "A consistent low-intensity movement routine can help make mobility a regular part of your day.",
        focus: [
          "Add gentle movement every day",
          "Take regular movement breaks",
          "Build a sustainable mobility routine",
        ],
        score: 86,
      },
    },
  },

  "digestive-wellness": {
    icon: Leaf,
    label: "Digestive Wellness Insight",

    default: {
      title: "Build mindful and consistent daily habits.",
      description:
        "Your personalized journey can focus on creating consistent meal and daily wellness habits.",
      focus: [
        "Maintain a consistent meal routine",
        "Practice mindful eating",
        "Add comfortable movement into your day",
      ],
      score: 80,
    },

    answers: {
      Morning: {
        title: "Let's create a calmer morning routine.",
        description:
          "Your routine can focus on starting the day consistently and avoiding a rushed morning rhythm.",
        focus: [
          "Create a consistent morning routine",
          "Start your day without rushing",
          "Build mindful daily habits",
        ],
        score: 85,
      },

      "After meals": {
        title: "Let's make your meals more mindful.",
        description:
          "Since discomfort is noticed after meals, your personalized journey can focus on slower, more mindful eating habits.",
        focus: [
          "Slow down during meals",
          "Practice mindful eating",
          "Add comfortable movement after meals",
        ],
        score: 88,
      },

      Evening: {
        title: "Let's build a calmer evening routine.",
        description:
          "Your journey can focus on creating more consistency around evening meals and your nighttime routine.",
        focus: [
          "Keep your evening routine consistent",
          "Practice mindful eating",
          "Create a calmer transition into bedtime",
        ],
        score: 86,
      },

      "It varies": {
        title: "Consistency can be your foundation.",
        description:
          "Since your digestive discomfort varies, a predictable meal and daily routine can become the foundation of your personalized journey.",
        focus: [
          "Maintain a consistent meal routine",
          "Practice mindful eating",
          "Add comfortable daily movement",
        ],
        score: 87,
      },
    },
  },
};

function AIInsight({ selectedGoal, answer1, answer2 }) {
  const data =
    insightData[selectedGoal] ||
    insightData["deep-sleep"];

  const answerSpecific =
    data.answers?.[answer2];

  const finalData =
    answerSpecific || data.default;

  const Icon = data.icon;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-8"
    >
      <div className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-xl">

        {/* Top */}
        <div className="bg-green-950 p-6 text-white sm:p-8">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Icon size={24} />
              </div>

              <div>
                <p className="text-sm text-green-200">
                  AyurAI
                </p>

                <h3 className="font-semibold">
                  {data.label}
                </h3>
              </div>

            </div>

            <div className="rounded-full bg-white/10 px-4 py-2 text-xs text-green-100">
              AI Personalization
            </div>

          </div>

          <h2 className="mt-7 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
            {finalData.title}
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-green-100">
            {finalData.description}
          </p>

        </div>

        {/* Content */}
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_280px]">

          {/* Focus */}
          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-green-700">
              Recommended Focus
            </p>

            <div className="mt-5 space-y-3">

              {finalData.focus.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{
                    opacity: 0,
                    x: -15,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: index * 0.12,
                  }}
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4"
                >

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                    ✓
                  </div>

                  <p className="text-sm font-medium text-gray-700">
                    {item}
                  </p>

                </motion.div>
              ))}

            </div>

          </div>

          {/* Score */}
          <div className="rounded-3xl bg-green-50 p-6">

            <p className="text-sm font-medium text-green-800">
              Personalization Score
            </p>

            <div className="mt-5 flex items-end gap-1">

              <span className="text-5xl font-semibold text-green-950">
                {finalData.score}
              </span>

              <span className="mb-2 text-gray-500">
                /100
              </span>

            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-green-100">

              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${finalData.score}%`,
                }}
                transition={{
                  duration: 1.2,
                  ease: "easeOut",
                }}
                className="h-full rounded-full bg-green-700"
              />

            </div>

            <p className="mt-4 text-xs leading-5 text-gray-500">
              This is a personalization indicator for your
              selected wellness preferences, not a medical score
              or diagnosis.
            </p>

          </div>

        </div>

        {/* Answers */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 sm:px-8">

          <p className="text-xs font-medium uppercase tracking-[0.15em] text-gray-500">
            Your responses
          </p>

          <div className="mt-3 flex flex-wrap gap-3">

            {answer1 && (
              <motion.span
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="rounded-full bg-white px-4 py-2 text-sm text-green-900 shadow-sm"
              >
                {answer1}
              </motion.span>
            )}

            {answer2 && (
              <motion.span
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  delay: 0.08,
                }}
                className="rounded-full bg-white px-4 py-2 text-sm text-green-900 shadow-sm"
              >
                {answer2}
              </motion.span>
            )}

          </div>

        </div>

      </div>
    </motion.section>
  );
}

export default AIInsight;