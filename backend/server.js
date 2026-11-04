const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const { PrismaClient } = require("@prisma/client");
const { clerkMiddleware, getAuth } = require("@clerk/express");
const webpush = require("web-push");
const cron = require("node-cron");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
// CLERK AUTHENTICATION — MUST BE BEFORE CHAT ROUTES
app.use("/api/chat", clerkMiddleware());
app.use("/api/reminders", clerkMiddleware());

/* =====================================================
   OPENROUTER
===================================================== */

const ai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "AyurAI",
  },
});

const AI_MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "google/gemma-4-26b-a4b-it:free",
  "google/gemma-4-31b-it:free",
];

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AyurAI backend is running",
  });
});

// Health check endpoint for UptimeRobot
app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "healthy",
    service: "AyurAI backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Dedicated lightweight endpoint for uptime monitoring (e.g. UptimeRobot).
// No database or AI-provider calls are made from this route.
app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "healthy",
    service: "AyurAI backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* =====================================================
   AI WELLNESS ROUTINE
===================================================== */

app.post("/api/ai", async (req, res) => {
  const {
    clerkId,
    goal,
    diet,
    experience,
    question,
    answer1,
    answer2,
  } = req.body;

  console.log("\n🌿 AYURAI AI REQUEST");
  console.log({ clerkId, goal, diet, experience, question });

  if (!goal) {
    return res.status(400).json({
      success: false,
      message: "Goal is required",
    });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "OPENROUTER_API_KEY is missing from backend .env",
    });
  }

  const prompt = `
You are AyurAI, a high-quality personalized wellness assistant.

Create a detailed, practical, genuinely personalized daily wellness routine.

USER PROFILE:
Goal: ${goal || "General wellness"}
Diet: ${diet || "Not provided"}
Experience: ${experience || "Beginner"}
Personalization Answer 1: ${answer1 || "Not provided"}
Personalization Answer 2: ${answer2 || "Not provided"}
Specific Request: ${question || "Create a balanced daily wellness routine"}

PERSONALIZATION RULES:
- Use the actual profile details provided above.
- Never ask the user to provide information again.
- Make recommendations relevant to the selected goal.
- Respect the user's dietary preferences.
- Adjust recommendations to their experience level.
- Do not invent missing personal details.
- Give specific actions, examples, durations and timings.
- Keep recommendations realistic, affordable and easy to follow.
- Do not diagnose diseases or promise cures.
- Do not prescribe medicines or recommend unsafe practices.

REQUIRED OUTPUT:

🌿 Your AyurAI Wellness Routine

1. Morning Routine
Write 3 actionable bullet points with timings where appropriate.

2. Food & Hydration
Write 3 useful bullet points with food examples suited to the user's diet.

3. Daily Activity
Write 3 realistic movement suggestions.

4. Mind & Focus
Write 3 practical mental wellness techniques.

5. Evening & Sleep
Write 3 useful wind-down and sleep recommendations.

🌱 Your Personalized Tip
Give a 2-3 sentence summary of the most important next step.

OUTPUT RULES:
- Aim for 450-650 words when sufficient information is available.
- Use clear headings and readable bullet points.
- Explain recommendations instead of giving vague slogans.
- Do not leave headings empty.
- Return plain text, not JSON.
- Do not ask the user for profile details.
`;

  let lastError = null;

  for (const model of AI_MODELS) {
    try {
      console.log("\n🤖 Trying model:", model);

      const completion = await ai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are AyurAI, a safe and helpful AI wellness assistant. Return a complete plain-text wellness routine.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1800,
        temperature: 0.4,
      });

      const choice = completion?.choices?.[0];
      const message = choice?.message;
      let answer = message?.content ?? "";

      if (Array.isArray(answer)) {
        answer = answer
          .map((part) =>
            typeof part === "string" ? part : part?.text || ""
          )
          .join("\n");
      }

      if (typeof answer !== "string") {
        answer = "";
      }

      answer = answer.trim();

      console.log("MODEL:", model);
      console.log("ANSWER LENGTH:", answer.length);

      if (!answer) {
        throw new Error(`Model ${model} returned an empty response`);
      }

      // SAVE NEW ROUTINE AS THE USER'S CURRENT ROUTINE
      let savedRoutine = null;

      if (clerkId) {
        try {
          savedRoutine = await prisma.$transaction(async (tx) => {
            // 1. Make the previous current routine inactive
            await tx.routine.updateMany({
              where: {
                clerkId,
                isCurrent: true,
              },
              data: {
                isCurrent: false,
              },
            });

            // 2. Save the newly generated routine as current
            const newRoutine = await tx.routine.create({
              data: {
                clerkId,
                goal: String(goal),
                diet: diet || null,
                experience: experience || null,
                routine: answer,
                isFavorite: false,
                isCurrent: true,
              },
            });

            return newRoutine;
          });

          console.log(
            "NEW CURRENT ROUTINE SAVED:",
            savedRoutine.id
          );
        } catch (databaseError) {
          console.error(
            "ROUTINE SAVE FAILED:",
            databaseError.message
          );
        }
      }

      return res.json({
        success: true,
        answer,
        model,
        routineSaved: !!savedRoutine,
        routineId: savedRoutine?.id || null,
      });
    } catch (error) {
      lastError = error;

      console.error("AI MODEL FAILED:", {
        model,
        status: error?.status,
        code: error?.code,
        message: error?.message,
      });
    }
  }

  return res.status(500).json({
    success: false,
    message: "AI response failed",
    error: lastError?.message || "All available AI models failed.",
  });
});

/* =====================================================
   USER PERSONALIZATION
===================================================== */

app.post("/api/user", async (req, res) => {
  try {
    const { clerkId, goal, answer1, answer2 } = req.body;

    if (!clerkId || !goal) {
      return res.status(400).json({
        success: false,
        message: "Clerk ID and goal are required",
      });
    }

    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        goal,
        answer1: answer1 || null,
        answer2: answer2 || null,
      },
      create: {
        clerkId,
        goal,
        answer1: answer1 || null,
        answer2: answer2 || null,
      },
    });

    return res.json({
      success: true,
      message: "User personalization saved successfully",
      user,
    });
  } catch (error) {
    console.error("DATABASE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save user data",
      error: error?.message || "Unknown database error",
    });
  }
});
/* =====================================================
   ROUTINE HISTORY
===================================================== */

app.get("/api/routines/:clerkId", async (req, res) => {
  try {
    const { clerkId } = req.params;

    const routines = await prisma.routine.findMany({
      where: { clerkId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      count: routines.length,
      routines,
    });
  } catch (error) {
    console.error("ROUTINE HISTORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch routine history",
      error: error?.message,
    });
  }
});

/* =====================================================
   ADD / REMOVE FAVORITE
===================================================== */

app.post("/api/routines/:clerkId/favorites", async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { routineId, favorite } = req.body;

    if (!clerkId || !routineId) {
      return res.status(400).json({
        success: false,
        message: "Clerk ID and routine ID are required",
      });
    }

    const routine = await prisma.routine.findUnique({
      where: { id: routineId },
    });

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: "Routine not found",
      });
    }

    if (routine.clerkId !== clerkId) {
      return res.status(403).json({
        success: false,
        message: "You cannot modify this routine",
      });
    }

    const updatedRoutine = await prisma.routine.update({
      where: { id: routineId },
      data: { isFavorite: favorite === true },
    });

    return res.json({
      success: true,
      message:
        favorite === true
          ? "Routine added to wishlist"
          : "Routine removed from wishlist",
      routine: updatedRoutine,
    });
  } catch (error) {
    console.error("WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update wishlist",
      error: error?.message,
    });
  }
});

/* =====================================================
   GET WISHLIST
===================================================== */

app.get("/api/routines/:clerkId/favorites", async (req, res) => {
  try {
    const { clerkId } = req.params;

    const favorites = await prisma.routine.findMany({
      where: {
        clerkId,
        isFavorite: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      count: favorites.length,
      routines: favorites,
    });
  } catch (error) {
    console.error("FETCH WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: error?.message,
    });
  }
});

/* =====================================================
   SET CURRENT ROUTINE
===================================================== */

app.post("/api/routines/:clerkId/current", async (req, res) => {
  try {
        const { clerkId } = req.params;
    const { routineId } = req.body;

    if (!clerkId || !routineId) {
      return res.status(400).json({
        success: false,
        message: "Clerk ID and routine ID are required",
      });
    }

    const routine = await prisma.routine.findUnique({
      where: { id: routineId },
    });

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: "Routine not found",
      });
    }

    if (routine.clerkId !== clerkId) {
      return res.status(403).json({
        success: false,
        message: "You cannot select this routine",
      });
    }

    await prisma.routine.updateMany({
      where: {
        clerkId,
        isCurrent: true,
      },
      data: { isCurrent: false },
    });

    const currentRoutine = await prisma.routine.update({
      where: { id: routineId },
      data: { isCurrent: true },
    });

    return res.json({
      success: true,
      message: "Current routine updated successfully",
      routine: currentRoutine,
    });
  } catch (error) {
    console.error("CURRENT ROUTINE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to set current routine",
      error: error?.message,
    });
  }
});

/* =====================================================
   GET CURRENT ROUTINE
===================================================== */

app.get("/api/routines/:clerkId/current", async (req, res) => {
  try {
    const { clerkId } = req.params;

    const currentRoutine = await prisma.routine.findFirst({
      where: {
        clerkId,
        isCurrent: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      routine: currentRoutine || null,
    });
  } catch (error) {
    console.error("GET CURRENT ROUTINE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch current routine",
      error: error?.message,
    });
  }
});

/* =====================================================
   REMOVE CURRENT ROUTINE
===================================================== */

app.delete("/api/routines/:clerkId/current", async (req, res) => {
  try {
    const { clerkId } = req.params;

    await prisma.routine.updateMany({
      where: {
        clerkId,
        isCurrent: true,
      },
      data: { isCurrent: false },
    });

    return res.json({
      success: true,
      message: "Current routine removed",
    });
  } catch (error) {
    console.error("REMOVE CURRENT ROUTINE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove current routine",
      error: error?.message,
    });
  }
});

/* =====================================================
   GET SINGLE ROUTINE
===================================================== */

app.get("/api/routines/detail/:id", async (req, res) => {
  try {
    const routine = await prisma.routine.findUnique({
      where: { id: req.params.id },
    });

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: "Routine not found",
      });
    }

    return res.json({
      success: true,
      routine,
    });
  } catch (error) {
    console.error("SINGLE ROUTINE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch routine",
      error: error?.message,
    });
  }
});

/* =====================================================
   DELETE ROUTINE
===================================================== */

app.delete("/api/routines/:id", async (req, res) => {
  try {
    await prisma.routine.delete({
      where: { id: req.params.id },
    });
        return res.json({
      success: true,
      message: "Routine deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ROUTINE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete routine",
      error: error?.message,
    });
  }
});

/* =====================================================
   AYURAI PROGRESS TRACKING
===================================================== */

const PROGRESS_TASK_COUNT = 15;

function isValidProgressDate(date) {
  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
}

function getPreviousDates(endDate, numberOfDays) {
  const [year, month, day] = endDate.split("-").map(Number);
  const end = new Date(Date.UTC(year, month - 1, day));

  return Array.from({ length: numberOfDays }, (_, index) => {
    const current = new Date(end);

    current.setUTCDate(
      end.getUTCDate() - (numberOfDays - 1 - index)
    );

    return current.toISOString().slice(0, 10);
  });
}

/* GET PROGRESS */

app.get("/api/progress/:clerkId", async (req, res) => {
  try {
    const { clerkId } = req.params;
    const date = req.query.date;

    if (!clerkId || !isValidProgressDate(date)) {
      return res.status(400).json({
        success: false,
        message: "A valid clerkId and date (YYYY-MM-DD) are required.",
      });
    }

    const dates = getPreviousDates(date, 7);

    const records = await prisma.routineCompletion.findMany({
      where: {
        clerkId,
        date: { in: dates },
      },
    });

    const todayRecords = records.filter(
      (record) => record.date === date && record.completed
    );

    const weekly = dates.map((day) => {
      const completedCount = records.filter(
        (record) => record.date === day && record.completed
      ).length;

      return {
        date: day,
        completed: Math.min(completedCount, PROGRESS_TASK_COUNT),
        total: PROGRESS_TASK_COUNT,
        percentage: Math.round(
          (Math.min(completedCount, PROGRESS_TASK_COUNT) /
            PROGRESS_TASK_COUNT) * 100
        ),
      };
    });

    return res.json({
      success: true,
      date,
      tasks: todayRecords.map((record) => ({
        taskIndex: record.taskIndex,
        completed: record.completed,
      })),
      today: {
        completed: todayRecords.length,
        total: PROGRESS_TASK_COUNT,
        percentage: Math.round(
          (todayRecords.length / PROGRESS_TASK_COUNT) * 100
        ),
      },
      weekly,
    });
  } catch (error) {
    console.error("Progress fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch progress.",
    });
  }
});

/* SAVE PROGRESS */

app.post("/api/progress/:clerkId", async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { date, taskIndex, completed } = req.body;

    if (!clerkId || !isValidProgressDate(date)) {
      return res.status(400).json({
        success: false,
        message: "A valid clerkId and date are required.",
      });
    }

    if (
      !Number.isInteger(taskIndex) ||
      taskIndex < 0 ||
      taskIndex >= PROGRESS_TASK_COUNT
    ) {
      return res.status(400).json({
        success: false,
        message: "taskIndex must be an integer from 0 to 14.",
      });
    }

    if (typeof completed !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "completed must be true or false.",
      });
    }

    const existing = await prisma.routineCompletion.findFirst({
      where: { clerkId, date, taskIndex },
    });

    const record = existing
      ? await prisma.routineCompletion.update({
          where: { id: existing.id },
          data: { completed },
        })
      : await prisma.routineCompletion.create({
          data: {
            clerkId,
            date,
            taskIndex,
            completed,
            goal: "Daily Wellness Routine",
          },
        });

    return res.json({
      success: true,
      message: "Progress saved successfully.",
      record,
    });
  } catch (error) {
    console.error("Progress save error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save progress.",
    });
  }
});

/* =====================================================
   AYURAI CHATBOT
===================================================== */

/* Clerk middleware MUST be registered before chat routes */

const CHAT_SYSTEM_PROMPT = `
You are AyurAI, a friendly and responsible AI wellness assistant.

Your purpose:
- Explain general health and wellness information.
- Help users build healthy everyday habits.
- Discuss Ayurveda as a traditional wellness system.
- Explain nutrition, sleep, exercise and stress management.
- Give practical, balanced and easy-to-understand suggestions.

IMPORTANT SAFETY RULES:
- You are not a doctor and must never claim to diagnose diseases.
- Never prescribe medicines or recommend changing prescribed treatment.
- Never promise cures or guaranteed health outcomes.
- Do not recommend unsafe detoxes or extreme diets.
- Clearly distinguish traditional Ayurvedic beliefs from established medical evidence.
- Encourage users to consult qualified healthcare professionals for medical symptoms.
- For severe or potentially life-threatening symptoms, advise immediate emergency medical care.
- Do not invent medical facts, research or references.
- If information is uncertain, say so honestly.
- Be respectful of the user's dietary preferences and lifestyle.
- Do not ask for unnecessary personal or sensitive information.

RESPONSE STYLE:
- Be warm, natural and conversational.
- Use simple language.
- Use headings and bullet points when helpful.
- Answer the actual question.
- Keep responses clear and useful.
`;

/* GET AUTHENTICATED CLERK USER */

function getChatUserId(req) {
  const auth = getAuth(req);
  return auth?.userId || null;
}

/* CREATE NEW CHAT */

app.post("/api/chat/conversations", async (req, res) => {
  try {
    const clerkId = getChatUserId(req);

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: "Please sign in to start a conversation.",
      });
    }

    const conversation = await prisma.conversation.create({
      data: {
        clerkId,
        title: "New Chat",
      },
    });

    return res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("CREATE CHAT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create conversation.",
    });
  }
});

/* GET ALL USER CHATS */

app.get("/api/chat/conversations", async (req, res) => {
  try {
    const clerkId = getChatUserId(req);

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const conversations = await prisma.conversation.findMany({
      where: { clerkId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({      success: true,
      conversations,
    });
  } catch (error) {
    console.error("FETCH CHATS ERROR:", error);

    return res.status(500).json({
      success: false,
            message: "Unable to load conversations.",
    });
  }
});

/* GET CHAT MESSAGES */

app.get("/api/chat/conversations/:id", async (req, res) => {
  try {
    const clerkId = getChatUserId(req);

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: req.params.id,
        clerkId,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    return res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("LOAD CHAT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load conversation.",
    });
  }
});

/* =====================================================
   SEND MESSAGE + ROUTINE MEMORY + ROUTINE UPDATES
===================================================== */

app.post("/api/chat/conversations/:id/messages", async (req, res) => {
  try {
    // 1. Verify Clerk authentication
    const clerkId = getChatUserId(req);

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: "Please sign in to chat.",
      });
    }

    // 2. Read user message
    const rawMessage = req.body?.message ?? req.body?.content;

    const content =
      typeof rawMessage === "string"
        ? rawMessage.trim()
        : "";

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    if (content.length > 8000) {
      return res.status(400).json({
        success: false,
        message: "Message is too long.",
      });
    }

    // 3. Verify conversation ownership
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: req.params.id,
        clerkId,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    // 4. Check OpenRouter API key
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "OpenRouter API key is missing.",
      });
    }

    // 5. Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content,
      },
    });

    // 6. Update conversation title
    const title =
      conversation.title === "New Chat" ||
      conversation.title === "New conversation"
        ? content.slice(0, 45)
        : conversation.title;

    // 7. Fetch recent conversation history
    const history = await prisma.chatMessage.findMany({
      where: {
        conversationId: conversation.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    history.reverse();

    // 8. Fetch saved user profile
    const userProfile = await prisma.user.findUnique({
      where: {
        clerkId,
      },
      select: {
        goal: true,
        answer1: true,
        answer2: true,
      },
    });

    // 9. Fetch current routine
    let currentRoutine = await prisma.routine.findFirst({
      where: {
        clerkId,
        isCurrent: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(
      currentRoutine
        ? `🌿 ROUTINE MEMORY LOADED: ${currentRoutine.id}`
        : "⚠️ NO CURRENT ROUTINE FOUND"
    );

    // =================================================
    // 10. DETECT EXPLICIT ROUTINE UPDATE REQUEST
    // =================================================

    const updateActionPattern =
      /\b(add|include|insert|remove|delete|take out|replace|change|update|modify|edit|improve|hata(?:o)?|nikal(?:o)?|jod(?:o)?|daal(?:o)?|badal(?:o)?|change kar|add kar|hata do|jod do)\b/i;

    const routineReferencePattern =
      /\b(routine|wellness routine|daily routine|plan|schedule)\b/i;

    const isRoutineUpdateRequest =
      updateActionPattern.test(content) &&
      routineReferencePattern.test(content);

    let routineUpdated = false;

    // =================================================
    // 11. UPDATE ROUTINE ONLY ON EXPLICIT REQUEST
    // =================================================

    if (isRoutineUpdateRequest) {
      if (!currentRoutine) {
        return res.status(400).json({
          success: false,
          message:
            "No current routine was found. Please generate a routine first.",
          routineUpdated: false,
        });
      }

      console.log("✏️ EXPLICIT ROUTINE UPDATE REQUEST DETECTED");

      let revisedRoutine = "";
      let updateError = null;
      let updateModel = "";

      const updatePrompt = `
You are updating an existing saved wellness routine.

The user has explicitly requested this change:

USER'S REQUEST:
${content}

EXISTING SAVED ROUTINE:
${currentRoutine.routine}

ROUTINE DETAILS:
Goal: ${currentRoutine.goal || "Not provided"}
Diet: ${currentRoutine.diet || "Not provided"}
Experience: ${currentRoutine.experience || "Not provided"}

YOUR TASK:

1. Apply only the change explicitly requested by the user.
2. Preserve all unrelated sections and recommendations.
3. Do not remove existing items unless the user asks you to remove them.
4. Do not invent personal information.
5. Keep the existing routine's structure and headings wherever possible.
6. Keep the advice practical and safe.
7. Do not add medicines, diagnoses, extreme diets or unsafe practices.
8. If the user asks to add something, add it to the most appropriate section.
9. If the user asks to remove something, remove only that requested item.
10. If the user asks to replace something, replace only that item.
11. Return the COMPLETE revised routine, not just the changed section.
12. Do not return JSON.
13. Do not explain what you changed outside the routine.
14. Do not claim that the database has been updated.

IMPORTANT:
The existing routine is the source of truth.
Do not rewrite unrelated content unnecessarily.

Return only the complete updated routine.
`;

      // Try available models for routine revision
      for (const model of AI_MODELS) {
        try {
          console.log("🔄 Routine update model:", model);

          const completion = await ai.chat.completions.create({
            model,
            messages: [
              {
                role: "system",
                content:
                  "You are a careful wellness routine editor. Preserve existing content and apply only the user's explicit requested change.",
              },
              {
                role: "user",
                content: updatePrompt,
              },
            ],
            max_tokens: 2200,
            temperature: 0.2,
          });

          let revisedContent =
            completion?.choices?.[0]?.message?.content ?? "";

          if (Array.isArray(revisedContent)) {
            revisedContent = revisedContent
              .map((part) =>
                typeof part === "string"
                  ? part
                  : part?.text || ""
              )
              .join("\n");
          }

          if (
            typeof revisedContent !== "string" ||
            revisedContent.trim().length < 50
          ) {
            throw new Error(
              "AI returned an invalid updated routine."
            );
          }

          revisedRoutine = revisedContent.trim();
          updateModel = model;

          break;

        } catch (error) {
          updateError = error;

          console.error("ROUTINE UPDATE MODEL FAILED:", {
                        model,
            message: error?.message,
          });
        }
      }

      // Do not save if all models failed
      if (!revisedRoutine) {
        return res.status(502).json({
          success: false,
          message:
            "I could not safely update your routine. Please try again.",
          routineUpdated: false,
          error: updateError?.message || "Routine update failed.",
        });
      }

      // 12. Save revised routine to database
      const saveResult = await prisma.routine.updateMany({
        where: {
          id: currentRoutine.id,
          clerkId,
          isCurrent: true,
        },
        data: {
          routine: revisedRoutine,
        },
      });

      if (saveResult.count !== 1) {
        throw new Error(
          "Routine was not updated because the current routine changed. Please try again."
        );
      }

      // Reload updated routine from database
      currentRoutine = await prisma.routine.findFirst({
        where: {
          id: currentRoutine.id,
          clerkId,
          isCurrent: true,
        },
      });

      if (!currentRoutine) {
        throw new Error(
          "Updated routine could not be reloaded from database."
        );
      }

      routineUpdated = true;

      console.log("✅ ROUTINE UPDATED SUCCESSFULLY:", {
        routineId: currentRoutine.id,
        model: updateModel,
      });
    }

    // =================================================
    // 13. PREPARE PROFILE CONTEXT
    // =================================================

    const profileContext = userProfile
      ? `
USER'S SAVED WELLNESS PROFILE:

Goal: ${userProfile.goal || "Not provided"}
Preference 1: ${userProfile.answer1 || "Not provided"}
Preference 2: ${userProfile.answer2 || "Not provided"}

Use this context only when relevant.
Never assume missing details.
`
      : "";

    // =================================================
    // 14. PREPARE CURRENT ROUTINE MEMORY
    // =================================================

    const routineContext = currentRoutine
      ? `
USER'S CURRENT SAVED AYURAI ROUTINE:

Routine ID: ${currentRoutine.id}
Goal: ${currentRoutine.goal || "Not provided"}
Diet / Preference: ${currentRoutine.diet || "Not provided"}
Experience: ${currentRoutine.experience || "Not provided"}

COMPLETE CURRENT ROUTINE:
${currentRoutine.routine}

ROUTINE MEMORY RULES:

1. This routine was retrieved from the user's database.
2. Always use this version as the current source of truth.
3. Answer routine-related questions using this saved routine.
4. Explain its sections when asked.
5. Do not invent details that are not present.
6. If a detail is missing, say it is not specified.
7. Do not confuse old conversation messages with the current routine.
8. If the user requested a routine update in this message, the backend has already saved the revised routine.
9. If routineUpdated is true, clearly acknowledge the saved change.
10. Never claim an update was saved unless it actually succeeded.
11. Suggestions alone do not modify the database.
`
      : `
USER'S CURRENT ROUTINE:

No current routine is saved in the database.

Do not invent a routine or pretend that one was retrieved.
`;

    // =================================================
    // 15. PREPARE AI CHAT
    // =================================================

    const chatMessages = [
      {
        role: "system",
        content:
          CHAT_SYSTEM_PROMPT +
          profileContext +
          routineContext +
          `
ADDITIONAL RESPONSE RULES:

- Be friendly and conversational.
- Answer the user's actual question.
- When a routine update has been saved, explain briefly what changed.
- Never claim that an unsaved change has been saved.
- If the user only asks for advice, give advice without claiming a database update.
`,
      },
      ...history.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ];

    // =================================================
    // 16. GENERATE AI RESPONSE
    // =================================================

    let assistantContent = "";
    let chatModel = "";
    let lastChatError = null;

    for (const model of AI_MODELS) {
      try {
        const completion = await ai.chat.completions.create({
          model,
          messages: chatMessages,
          max_tokens: 1200,
          temperature: 0.4,
        });

        let responseContent = completion?.choices?.[0]?.message?.content ?? "";

        if (Array.isArray(responseContent)) {
          responseContent = responseContent
            .map((part) =>
              typeof part === "string" ? part : part?.text || ""
            )
            .join("\n");
        }

        if (typeof responseContent !== "string" || !responseContent.trim()) {
          throw new Error(`Model ${model} returned an empty response.`);
        }

        assistantContent = responseContent.trim();
        chatModel = model;
        break;
      } catch (error) {
        lastChatError = error;
        console.error("CHAT MODEL FAILED:", {
          model,
          message: error?.message,
        });
      }
    }

    if (!assistantContent) {
      return res.status(502).json({
        success: false,
        message: "Unable to generate a response. Please try again.",
        error: lastChatError?.message || "All available AI models failed.",
      });
    }

    const assistantMessage = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: assistantContent,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { title },
    });

    return res.json({
      success: true,
      userMessage,
      assistantMessage,
      routineUpdated,
      model: chatModel,
    });
  } catch (error) {
    console.error("SEND CHAT MESSAGE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send message.",
    });
  }
});


// VAPID configuration for Web Push notifications
const VAPID_READY = Boolean(
  process.env.VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_SUBJECT
);

if (VAPID_READY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn("VAPID keys missing. Push notifications are disabled.");
}

/* Send due notifications. The unique reminderId + scheduledFor key prevents duplicate deliveries. */
// ========================================
// REMINDER DUE TIME CALCULATOR
// ========================================

function reminderIsDue(reminder, now = new Date()) {
  try {
    const timezone = reminder.timezone || "Asia/Kolkata";

    // Get current date and time in reminder's timezone
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

    const parts = formatter.formatToParts(now);

    const getPart = (type) =>
      parts.find((part) => part.type === type)?.value;

    const weekday = getPart("weekday");
    const year = Number(getPart("year"));
    const month = Number(getPart("month"));
    const day = Number(getPart("day"));
    const hour = Number(getPart("hour"));
    const minute = Number(getPart("minute"));

    // Check whether today is a selected reminder day
    const allowedDays = reminder.days || [
      "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
    ];

    if (!allowedDays.includes(weekday)) {
      return null;
    }

    // Parse reminder start time
    const [startHour, startMinute] = reminder.time.split(":").map(Number);

    if (
      !Number.isInteger(startHour) ||
      !Number.isInteger(startMinute) ||
      startHour < 0 ||
      startHour > 23 ||
      startMinute < 0 ||
      startMinute > 59
    ) {
      return null;
    }

    const currentMinutes = hour * 60 + minute;
    const startMinutes = startHour * 60 + startMinute;

    let scheduledMinutes = startMinutes;

    // Handle interval-based reminders
    if (reminder.intervalMinutes && reminder.intervalMinutes > 0) {
      if (!reminder.endTime) {
        // Without an end time, send only at the start time
        if (currentMinutes !== startMinutes) return null;
      } else {
        const [endHour, endMinute] = reminder.endTime
          .split(":")
          .map(Number);

        if (
          !Number.isInteger(endHour) ||
          !Number.isInteger(endMinute)
        ) {
          return null;
        }

        const endMinutes = endHour * 60 + endMinute;

        if (
          currentMinutes < startMinutes ||
          currentMinutes > endMinutes
        ) {
          return null;
        }

        const elapsed = currentMinutes - startMinutes;

        if (elapsed % reminder.intervalMinutes !== 0) {
          return null;
        }

        scheduledMinutes =
          startMinutes +
          Math.floor(elapsed / reminder.intervalMinutes) *
            reminder.intervalMinutes;
      }
    } else {
      // Normal reminder: exact scheduled minute
      if (currentMinutes !== startMinutes) {
        return null;
      }
    }

    // Convert the scheduled local time into a UTC Date
    const scheduledHour = Math.floor(scheduledMinutes / 60);
    const scheduledMinute = scheduledMinutes % 60;

    const localDate = new Date(
      Date.UTC(year, month - 1, day, scheduledHour, scheduledMinute)
    );

    const utcFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

    // Adjust UTC timestamp until its displayed local time matches
    const target = {
      year,
      month,
      day,
      hour: scheduledHour,
      minute: scheduledMinute,
    };

    let timestamp = localDate.getTime();

    for (let i = 0; i < 3; i++) {
      const utcParts = utcFormatter.formatToParts(new Date(timestamp));

      const getUtcPart = (type) =>
        Number(utcParts.find((part) => part.type === type)?.value);

      const displayed = {
        year: getUtcPart("year"),
        month: getUtcPart("month"),
        day: getUtcPart("day"),
        hour: getUtcPart("hour"),
        minute: getUtcPart("minute"),
      };

      const difference =
        Date.UTC(
          target.year,
          target.month - 1,
          target.day,
          target.hour,
          target.minute
        ) -
        Date.UTC(
          displayed.year,
          displayed.month - 1,
          displayed.day,
          displayed.hour,
          displayed.minute
        );

      if (difference === 0) break;

      timestamp += difference;
    }

    return new Date(timestamp);
  } catch (error) {
    console.error("REMINDER TIME CALCULATION ERROR:", error);
    return null;
  }
}


async function dispatchDueReminders() {
  if (!VAPID_READY) return;

  const now = new Date();
  const reminders = await prisma.reminder.findMany({
    where: { enabled: true },
  });

  for (const reminder of reminders) {
    try {
      const scheduledKey = reminderIsDue(reminder, now);
      if (!scheduledKey) continue;

      // Use a stable UTC minute key after deriving the local due minute.
      const scheduledFor = new Date(
        Math.floor(now.getTime() / 60000) * 60000
      );

      const delivery = await prisma.reminderDelivery
        .create({
          data: {
            reminderId: reminder.id,
            scheduledFor,
            status: "pending",
          },
        })
        .catch((error) => {
          if (error?.code === "P2002") return null;
          throw error;
        });

      if (!delivery) continue;

      const subscriptions = await prisma.pushSubscription.findMany({
        where: { clerkId: reminder.clerkId },
      });

      const payload = JSON.stringify({
        title: reminder.title,
        body: "It's time for your AyurAI wellness reminder.",
        tag: `ayurai-${reminder.id}`,
        url: "/",
      });

      let delivered = 0;

      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          );

          delivered += 1;
        } catch (pushError) {
          console.error(
            "PUSH DELIVERY ERROR:",
            pushError?.statusCode || pushError?.message
          );

          if (
            pushError?.statusCode === 404 ||
            pushError?.statusCode === 410
          ) {
            await prisma.pushSubscription.deleteMany({
              where: { id: sub.id },
            });
          }
        }
      }

      await prisma.reminderDelivery.update({
        where: { id: delivery.id },
        data: {
          status: delivered ? "sent" : "no_subscription",
          sentAt: delivered ? new Date() : null,
        },
      });
    } catch (error) {
      console.error(
        "REMINDER DISPATCH ERROR:",
        reminder.id,
        error?.message || error
      );
    }
  }
}

cron.schedule("* * * * *", () => {
  dispatchDueReminders().catch((error) =>
    console.error("REMINDER SCHEDULER ERROR:", error)
  );
});

/* =====================================================
   START SERVER
===================================================== */

async function startServer() {
  try {
    await prisma.$connect();

    console.log("Prisma database: CONNECTED");

    app.listen(PORT, () => {
      console.log("\n🌿 AYURAI BACKEND");
      console.log(`Server running on http://localhost:${PORT}`);
      console.log("AI routine API: /api/ai");
      console.log("User API: /api/user");
      console.log("Routine API: /api/routines");
      console.log("Progress API: /api/progress");
      console.log("AI Chat API: /api/chat");
      console.log("Smart Reminders API: /api/reminders");
      console.log("Push scheduler: every minute");
      console.log("Prisma database: CONNECTED");
    });
  } catch (error) {
    console.error("DATABASE CONNECTION FAILED:", error);
    process.exit(1);
  }
}

startServer();
