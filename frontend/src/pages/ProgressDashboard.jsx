
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

const API_URL = "http://https://ayurai-backend-u1e8.onrender.com/api/progress";
const REMINDERS_API = "http://https://ayurai-backend-u1e8.onrender.com/api/reminders";
const TOTAL_TASKS = 15;

const FALLBACK_SECTIONS = [
  {
    title: "Morning Routine",
    tasks: [
      "Wake with gentle movement (5–7 min)",
      "Hydrate mindfully (8 oz water)",
      "Set a brief intention (2 min)",
    ],
  },
  {
    title: "Food & Hydration",
    tasks: [
      "Balanced breakfast",
      "Mid-day meal with varied colors",
      "Consistent water intake",
    ],
  },
  {
    title: "Daily Activity",
    tasks: [
      "Movement break every 90 minutes",
      "Purposeful walk (20–30 min)",
      "Strength-friendly routine",
    ],
  },
  {
    title: "Mind & Focus",
    tasks: [
      "Box breathing for reset",
      "Micro-mindfulness pause",
      "Gratitude jot-down",
    ],
  },
  {
    title: "Evening & Sleep",
    tasks: [
      "Digital dimming before bed",
      "Light stretching or yoga",
      "Consistent sleep window",
    ],
  },
];

const REMINDER_CATEGORIES = [
  { value: "hydration", label: "Water", icon: "💧" },
  { value: "exercise", label: "Exercise", icon: "🏃" },
  { value: "medicine", label: "Medicine", icon: "💊" },
  { value: "meditation", label: "Meditation", icon: "🧘" },
  { value: "meal", label: "Healthy Meal", icon: "🥗" },
  { value: "sleep", label: "Sleep", icon: "😴" },
  { value: "walking", label: "Walking", icon: "🚶" },
  { value: "custom", label: "Custom", icon: "🌿" },
];

function getToday() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function getSavedRoutine(userId) {
  try {
    const userSpecific = userId
      ? localStorage.getItem(`ayurAI_currentRoutine_${userId}`)
      : null;

    const generic = localStorage.getItem("ayurAI_currentRoutine");
    const raw = userSpecific || generic;

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (parsed.clerkId && parsed.clerkId !== userId) {
      return null;
    }

    if (
      typeof parsed.routine !== "string" ||
      !parsed.routine.trim()
    ) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Could not read saved AyurAI routine:", error);
    return null;
  }
}

function parseRoutineSections(routineText) {
  if (!routineText) return null;

  const lines = routineText.split(/\r?\n/);
  const sections = [];
  let currentSection = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    const heading = line.match(
      /^\s*(?:#{1,6}\s*)?(?:\d+[.)]\s*)?(Morning Routine|Food\s*&\s*Hydration|Daily Activity|Mind\s*&\s*Focus|Evening(?:\s*&|\/)\s*Sleep)\s*:?\s*$/i
    );

    if (heading) {
      if (currentSection) sections.push(currentSection);

      const name = heading[1].toLowerCase();
      let title = "Morning Routine";

      if (name.startsWith("food")) title = "Food & Hydration";
      else if (name.startsWith("daily")) title = "Daily Activity";
      else if (name.startsWith("mind")) title = "Mind & Focus";
      else if (name.startsWith("evening")) title = "Evening & Sleep";

      currentSection = { title, tasks: [] };
      continue;
    }

    if (!currentSection) continue;

    const bullet = line.match(/^\s*[-*+]\s+(.+)$/);

    if (bullet) {
      let task = bullet[1]
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/__(.*?)__/g, "$1")
        .trim();

      task = task.replace(/\s+/g, " ");

      if (task && !/personalized tip/i.test(task)) {
        currentSection.tasks.push(task);
      }
    }
  }

  if (currentSection) sections.push(currentSection);

  const expectedTitles = FALLBACK_SECTIONS.map(
    (section) => section.title
  );

  return expectedTitles.map((title) => {
    const found = sections.find(
      (section) => section.title === title
    );

    if (found?.tasks.length) {
      return {
        title,
        tasks: found.tasks.slice(0, 3),
      };
    }

    return FALLBACK_SECTIONS.find(
      (section) => section.title === title
    );
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  );
}

function getReminderCategory(type) {
  return (
    REMINDER_CATEGORIES.find(
      (category) => category.value === type
    ) || REMINDER_CATEGORIES.find(
      (category) => category.value === "custom"
    )
  );
}

export default function ProgressDashboard() {
  const { userId, isLoaded, isSignedIn, getToken } = useAuth();

  const [date, setDate] = useState(getToday());
  const [routine, setRoutine] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState("");

  const [reminders, setReminders] = useState([]);
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [reminderSaving, setReminderSaving] = useState(false);

  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderCategory, setReminderCategory] = useState("hydration");
  const [reminderTime, setReminderTime] = useState("07:00");
  const [reminderInterval, setReminderInterval] = useState("none");
  const [reminderEndTime, setReminderEndTime] = useState("21:00");
  const [reminderSnooze, setReminderSnooze] = useState("10");

  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("07:00");

  const [pushStatus, setPushStatus] = useState("");
  const [pushLoading, setPushLoading] = useState(false);

  const loadRoutine = useCallback(() => {
    if (!userId) {
      setRoutine(null);
      return;
    }

    setRoutine(getSavedRoutine(userId));
  }, [userId]);

  useEffect(() => {
    if (!isLoaded) return;

    loadRoutine();

    const handleRoutineUpdate = () => loadRoutine();

    window.addEventListener(
      "ayurAICurrentRoutineUpdated",
      handleRoutineUpdate
    );

    window.addEventListener("storage", handleRoutineUpdate);

    return () => {
      window.removeEventListener(
        "ayurAICurrentRoutineUpdated",
        handleRoutineUpdate
      );

      window.removeEventListener("storage", handleRoutineUpdate);
    };
  }, [isLoaded, loadRoutine]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      setLoading(false);
      setError("Please sign in to track your progress.");
      return;
    }

    let cancelled = false;

    async function loadProgress() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/${encodeURIComponent(userId)}?date=${date}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load progress.");
        }

        if (cancelled) return;

        setCompleted(
          (data.tasks || [])
            .filter((task) => task.completed)
            .map((task) => task.taskIndex)
            .filter(
              (index) => index >= 0 && index < TOTAL_TASKS
            )
        );

        setWeekly(data.weekly || []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Could not connect to the progress API."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [date, isLoaded, isSignedIn, userId]);

  const getReminderHeaders = useCallback(async () => {
    const token = await getToken();

    if (!token) {
      throw new Error(
        "Your sign-in session could not be verified. Please sign in again."
      );
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, [getToken]);

  const loadReminders = useCallback(async () => {
    if (!isSignedIn || !userId) return;

    setRemindersLoading(true);

    try {
      const headers = await getReminderHeaders();
      const response = await fetch(REMINDERS_API, { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load reminders.");
      }

      setReminders(data.reminders || []);
    } catch (err) {
      setError(err.message || "Could not load reminders.");
    } finally {
      setRemindersLoading(false);
    }
  }, [getReminderHeaders, isSignedIn, userId]);

  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      loadReminders();
    }

    if (isLoaded && !isSignedIn) {
      setReminders([]);
    }
  }, [isLoaded, isSignedIn, userId, loadReminders]);

  async function createReminder(event) {
    event.preventDefault();

    if (!reminderTitle.trim() || !reminderTime) return;

    setReminderSaving(true);
    setError("");

    try {
      const headers = await getReminderHeaders();

      const interval =
        reminderInterval === "none"
          ? null
          : Number(reminderInterval);

      const response = await fetch(REMINDERS_API, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: reminderTitle.trim(),
          type: reminderCategory,
          time: reminderTime,
          endTime: interval ? reminderEndTime : null,
          intervalMinutes: interval,
          timezone:
            Intl.DateTimeFormat().resolvedOptions().timeZone ||
            "Asia/Kolkata",
          days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          enabled: true,
          snoozeMinutes: Number(reminderSnooze),
          quietHoursStart: quietHoursStart || null,
          quietHoursEnd: quietHoursEnd || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not create reminder."
        );
      }

      setReminders((previous) => [
        ...previous,
        data.reminder,
      ]);

      setReminderTitle("");
      setReminderCategory("hydration");
      setReminderInterval("none");
    } catch (err) {
      setError(err.message || "Could not create reminder.");
    } finally {
      setReminderSaving(false);
    }
  }

  async function updateReminder(reminder, updates) {
    try {
      const headers = await getReminderHeaders();

      const response = await fetch(
        `${REMINDERS_API}/${encodeURIComponent(reminder.id)}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(updates),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not update reminder."
        );
      }

      setReminders((previous) =>
        previous.map((item) =>
          item.id === reminder.id ? data.reminder : item
        )
      );
    } catch (err) {
      setError(err.message || "Could not update reminder.");
    }
  }

  async function deleteReminder(reminder) {
    if (
      !window.confirm(
        `Delete "${reminder.title}" reminder?`
      )
    ) {
      return;
    }

    try {
      const headers = await getReminderHeaders();

      const response = await fetch(
        `${REMINDERS_API}/${encodeURIComponent(reminder.id)}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not delete reminder."
        );
      }

      setReminders((previous) =>
        previous.filter((item) => item.id !== reminder.id)
      );
    } catch (err) {
      setError(err.message || "Could not delete reminder.");
    }
  }

  async function enablePushNotifications() {
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setPushStatus(
        "Push notifications are not supported by this browser."
      );
      return;
    }

    setPushLoading(true);
    setPushStatus("");

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        throw new Error(
          "Notification permission was not granted. Allow notifications in your browser settings."
        );
      }

      const registration =
        await navigator.serviceWorker.register("/sw.js");

      const headers = await getReminderHeaders();

      const keyResponse = await fetch(
        `${REMINDERS_API}/vapid-public-key`,
        { headers }
      );

      const keyData = await keyResponse.json();

      if (!keyResponse.ok || !keyData.publicKey) {
        throw new Error(
          keyData.message ||
            "Could not load push notification key."
        );
      }

      let subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            keyData.publicKey
          ),
        });
      }

      const saveResponse = await fetch(
        `${REMINDERS_API}/subscriptions`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            subscription: subscription.toJSON(),
          }),
        }
      );

      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(
          saveData.message ||
            "Could not save push subscription."
        );
      }

      setPushStatus(
        "Push notifications are enabled on this browser."
      );
    } catch (err) {
      setPushStatus(
        err.message || "Could not enable push notifications."
      );
    } finally {
      setPushLoading(false);
    }
  }

  const sections = parseRoutineSections(routine?.routine);

  const hasActualRoutine = Boolean(
    sections && sections.some((section) => section.tasks.length)
  );

  const tasks = hasActualRoutine
    ? sections
        .flatMap((section) =>
          section.tasks.map((title) => ({
            section: section.title,
            title,
          }))
        )
        .slice(0, TOTAL_TASKS)
    : FALLBACK_SECTIONS.flatMap((section) =>
        section.tasks.map((title) => ({
          section: section.title,
          title,
        }))
      );

  const percentage = Math.round(
    (completed.length / TOTAL_TASKS) * 100
  );

  const fullDays = weekly.filter(
    (day) => day.completed >= TOTAL_TASKS
  );

  const currentStreak = (() => {
    const completedDates = new Set(
      fullDays.map((day) => day.date)
    );

    let streak = 0;
    const cursor = new Date(`${date}T12:00:00`);

    if (!completedDates.has(date)) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (true) {
      const year = cursor.getFullYear();
      const month = String(cursor.getMonth() + 1).padStart(2, "0");
      const day = String(cursor.getDate()).padStart(2, "0");
      const key = `${year}-${month}-${day}`;

      if (!completedDates.has(key)) break;

      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  })();

  const bestStreakInWeek = (() => {
    let best = 0;
    let run = 0;

    weekly.forEach((day) => {
      if (day.completed >= TOTAL_TASKS) {
        run += 1;
        best = Math.max(best, run);
      } else {
        run = 0;
      }
    });

    return best;
  })();

  async function toggleTask(index) {
    if (!userId || saving !== null) return;

    const nextCompleted = !completed.includes(index);
    const previousCompleted = completed;

    setSaving(index);
    setError("");

    setCompleted((previous) =>
      nextCompleted
        ? [...previous, index]
        : previous.filter((item) => item !== index)
    );

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(userId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date,
            taskIndex: index,
            completed: nextCompleted,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not save progress."
        );
      }

      const refresh = await fetch(
        `${API_URL}/${encodeURIComponent(userId)}?date=${date}`
      );

      if (refresh.ok) {
        const refreshedData = await refresh.json();

        setCompleted(
          (refreshedData.tasks || [])
            .filter((task) => task.completed)
            .map((task) => task.taskIndex)
        );

        setWeekly(refreshedData.weekly || []);
      }
    } catch (err) {
      setCompleted(previousCompleted);
      setError(err.message || "Could not save progress.");
    } finally {
      setSaving(null);
    }
  }

  if (!isLoaded) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-10">
        Loading...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 text-green-950">
      <header className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
          AYURAI WELLNESS
        </p>

        <h1 className="text-3xl font-bold sm:text-4xl">
          Progress Dashboard
        </h1>

        <p className="mt-3 text-gray-600">
          Track the small steps in your personalized wellness plan.
        </p>
      </header>

      {!isSignedIn && (
        <p className="mb-5 rounded-xl bg-white p-4 text-gray-700">
          Please sign in to use your personal progress dashboard.
        </p>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {isSignedIn && !routine && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-950">
            No current routine found
          </h2>
          <p className="mt-2 text-sm text-amber-900">
            Generate a routine and select “Set as Current Routine”.
            Your checklist will use the saved routine when it is available.
          </p>
        </div>
      )}

      <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Today's progress</p>
            <p className="mt-1 text-3xl font-bold">
              {completed.length} / {TOTAL_TASKS} tasks
            </p>
          </div>

          <div className="text-right">
            <p className="text-3xl font-bold text-green-700">
              {percentage}%
            </p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-green-100">
          <div
            className="h-full rounded-full bg-green-700 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <label className="mt-6 block text-sm font-medium text-gray-700">
          Select date
          <input
            type="date"
            value={date}
            max={getToday()}
            onChange={(event) => setDate(event.target.value)}
            className="mt-2 block rounded-xl border border-gray-200 bg-white px-4 py-2"
          />
        </label>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Current streak</p>
          <p className="mt-2 text-3xl font-bold text-orange-600">
            🔥 {currentStreak} {currentStreak === 1 ? "day" : "days"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Consecutive fully completed days
          </p>
        </div>

        <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Full days this week</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {fullDays.length}/7
          </p>
          <p className="mt-1 text-xs text-gray-500">
            All 15 tasks completed
          </p>
        </div>

        <div className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Best streak in view</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            🏆 {bestStreakInWeek} {bestStreakInWeek === 1 ? "day" : "days"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Longest run in the displayed 7 days
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-2 text-xl font-bold">Daily checklist</h2>
        <p className="mb-4 text-sm text-gray-600">
          {hasActualRoutine
            ? `Tasks from your current routine: ${routine.goal || "Wellness"}`
            : "Showing suggested wellness tasks until a supported current routine is available."}
        </p>

        {loading ? (
          <p className="rounded-2xl bg-white p-5 text-gray-600">
            Loading progress...
          </p>
        ) : (
          <div className="space-y-6">
            {FALLBACK_SECTIONS.map((section) => {
              const sectionTasks = tasks
                .map((task, index) => ({ ...task, index }))
                .filter((task) => task.section === section.title);

              if (!sectionTasks.length) return null;

              return (
                <div key={section.title}>
                  <h3 className="mb-3 font-bold text-green-900">
                    {section.title}
                  </h3>

                  <div className="space-y-3">
                    {sectionTasks.map((task) => {
                      const checked = completed.includes(task.index);

                      return (
                        <label
                          key={`${task.index}-${task.title}`}
                          className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition ${
                            checked
                              ? "border-green-200 bg-green-50"
                              : "border-gray-100 bg-white hover:border-green-200"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={saving !== null || !isSignedIn}
                            onChange={() => toggleTask(task.index)}
                            className="mt-1 h-5 w-5 accent-green-700"
                          />

                          <div className="flex-1">
                            <p className="font-semibold">{task.title}</p>
                          </div>

                          {saving === task.index && (
                            <span className="text-xs text-gray-500">
                              Saving...
                            </span>
                          )}

                          {checked && (
                            <span className="text-sm font-semibold text-green-700">
                              Done
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* WELLNESS REMINDERS */}
      <section className="mb-10 overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-[0_18px_55px_rgba(20,83,45,0.08)]">
        <div className="bg-gradient-to-br from-[#123f2b] via-[#17623d] to-[#23804e] px-6 py-7 text-white sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-green-50">
                <span>✦</span> AyurAI wellness
              </div>

              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Your wellness reminders
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-green-50/85">
                Choose what matters to you and build a healthier daily rhythm.
              </p>
            </div>

            <button
              type="button"
              onClick={enablePushNotifications}
              disabled={pushLoading || !isSignedIn}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white px-5 py-3 text-sm font-bold text-green-900 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span aria-hidden="true">♧</span>
              {pushLoading
                ? "Enabling notifications..."
                : "Enable notifications"}
            </button>
          </div>

          {pushStatus && (
            <p className="mt-5 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white">
              {pushStatus}
            </p>
          )}
        </div>

        <div className="grid gap-3 border-b border-green-50 bg-[#fbfcf8] p-5 sm:grid-cols-3 sm:px-8">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-green-900/5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
              🔔
            </span>
            <div>
              <p className="text-2xl font-bold text-green-950">
                {reminders.length}
              </p>
              <p className="text-xs font-medium text-gray-500">
                Total reminders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-green-900/5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
              ✓
            </span>
            <div>
              <p className="text-2xl font-bold text-green-700">
                {reminders.filter((reminder) => reminder.enabled).length}
              </p>
              <p className="text-xs font-medium text-gray-500">
                Active reminders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-green-900/5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl">
              ⏸
            </span>
            <div>
              <p className="text-2xl font-bold text-gray-700">
                {reminders.filter((reminder) => !reminder.enabled).length}
              </p>
              <p className="text-xs font-medium text-gray-500">
                Paused reminders
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">
                Create a routine
              </p>
              <h3 className="mt-1 text-xl font-bold text-green-950">
                Add a new reminder
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a category and choose when AyurAI should remind you.
              </p>
            </div>

            <form
              onSubmit={createReminder}
              className="space-y-4 rounded-3xl bg-[#f7f8f2] p-4 ring-1 ring-green-900/5 sm:p-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  What should we remind you about?
                </label>

                <select
                  value={reminderCategory}
                  onChange={(event) =>
                    setReminderCategory(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
                >
                  {REMINDER_CATEGORIES.map((category) => (
                    <option
                      key={category.value}
                      value={category.value}
                    >
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Reminder name
                </label>

                <input
                  type="text"
                  value={reminderTitle}
                  onChange={(event) =>
                    setReminderTitle(event.target.value)
                  }
                  placeholder="e.g. Drink a glass of water"
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
                />

                <p className="mt-2 text-xs text-gray-500">
                  You can write your own reminder name.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Start time
                  </label>

                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(event) =>
                      setReminderTime(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Repeat interval
                  </label>

                  <select
                    value={reminderInterval}
                    onChange={(event) =>
                      setReminderInterval(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
                  >
                    <option value="none">Once at selected time</option>
                    <option value="30">Every 30 minutes</option>
                    <option value="60">Every 1 hour</option>
                    <option value="90">Every 90 minutes</option>
                    <option value="120">Every 2 hours</option>
                  </select>
                </div>
              </div>

              {reminderInterval !== "none" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Repeat until
                  </label>

                  <input
                    type="time"
                    value={reminderEndTime}
                    onChange={(event) =>
                      setReminderEndTime(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Snooze duration
                  </label>

                  <select
                    value={reminderSnooze}
                    onChange={(event) =>
                      setReminderSnooze(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
                  >
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Quiet hours start
                  </label>

                  <input
                    type="time"
                    value={quietHoursStart}
                    onChange={(event) =>
                      setQuietHoursStart(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Quiet hours end
                </label>

                <input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(event) =>
                    setQuietHoursEnd(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
                />

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Notifications will respect the quiet-hours window you choose.
                </p>
              </div>

              <button
                type="submit"
                disabled={reminderSaving || !isSignedIn}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-800 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-green-900/10 transition hover:-translate-y-0.5 hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reminderSaving
                  ? "Saving reminder..."
                  : "＋ Create reminder"}
              </button>
            </form>
          </div>

          <div>
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">
                  Your schedule
                </p>
                <h3 className="mt-1 text-xl font-bold text-green-950">
                  Your reminders
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your active wellness nudges.
                </p>
              </div>

              <button
                type="button"
                onClick={loadReminders}
                disabled={remindersLoading || !isSignedIn}
                className="rounded-lg px-3 py-2 text-sm font-bold text-green-800 transition hover:bg-green-50 disabled:opacity-50"
              >
                {remindersLoading ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>

            {remindersLoading ? (
              <div className="rounded-2xl border border-dashed border-green-200 bg-green-50/50 p-8 text-center text-sm text-gray-600">
                Loading your reminders...
              </div>
            ) : reminders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-green-200 bg-green-50/50 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  🌿
                </div>

                <p className="mt-4 font-semibold text-green-950">
                  No reminders yet
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Create your first reminder and build a steady wellness rhythm.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder) => {
                  const category = getReminderCategory(reminder.type);

                  return (
                    <div
                      key={reminder.id}
                      className="group rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-green-200 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl">
                          {category.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-green-950">
                              {reminder.title}
                            </h4>

                            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
                              {category.label}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                reminder.enabled
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {reminder.enabled
                                ? "● Active"
                                : "Ⅱ Paused"}
                            </span>
                          </div>

                          <p className="mt-2 text-sm font-semibold text-gray-700">
                            {reminder.time}
                            {reminder.intervalMinutes
                              ? ` · Every ${reminder.intervalMinutes} min until ${reminder.endTime || "end time"}`
                              : " · Daily reminder"}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Snooze: {reminder.snoozeMinutes || 10} minutes
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
                        <button
                          type="button"
                          onClick={() =>
                            updateReminder(reminder, {
                              enabled: !reminder.enabled,
                            })
                          }
                          className="flex-1 rounded-xl border border-green-200 px-3 py-2.5 text-sm font-bold text-green-800 transition hover:bg-green-50"
                        >
                          {reminder.enabled
                            ? "Ⅱ Pause reminder"
                            : "▶ Resume reminder"}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteReminder(reminder)}
                          className="rounded-xl border border-red-100 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:border-red-200 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-green-50 bg-[#fbfcf8] px-6 py-4 text-center text-xs font-medium text-gray-500 sm:px-8">
          Small steps, better balance. AyurAI is here to keep you consistent.
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Last 7 days</h2>

        <p className="mt-2 text-sm text-gray-500">
          Daily completion across the 15 checklist items.
        </p>

        <div className="mt-6 rounded-2xl bg-green-50 p-4">
          <h3 className="mb-5 font-semibold text-green-950">
            Weekly completion chart
          </h3>

          <div className="flex h-44 items-end justify-around gap-2">
            {weekly.map((day) => (
              <div
                key={day.date}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-xs font-semibold text-green-900">
                  {day.percentage}%
                </span>

                <div className="flex h-28 w-full max-w-10 items-end overflow-hidden rounded-t-lg bg-green-100">
                  <div
                    className="w-full rounded-t-lg bg-green-700 transition-all duration-300"
                    style={{
                      height: `${Math.max(
                        day.percentage,
                        day.percentage > 0 ? 4 : 0
                      )}%`,
                    }}
                    title={`${day.completed} of ${day.total} tasks completed`}
                  />
                </div>

                <span className="text-xs text-gray-600">
                  {new Date(`${day.date}T12:00:00`).toLocaleDateString(
                    "en-IN",
                    { weekday: "short" }
                  )}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Each bar represents the percentage of tasks completed that day.
          </p>
        </div>

        {weekly.length === 0 ? (
          <p className="mt-4 text-gray-500">
            Weekly summary will appear when progress is available.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {weekly.map((day) => (
              <div key={day.date}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span>
                    {new Date(`${day.date}T12:00:00`).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "short" }
                    )}
                  </span>

                  <span className="font-medium">
                    {day.completed}/{day.total} · {day.percentage}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-green-700"
                    style={{ width: `${day.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
