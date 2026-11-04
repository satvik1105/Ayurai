import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/clerk-react";

function CurrentRoutine() {
  const { userId, isSignedIn } = useAuth();

  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     LOAD CURRENT ROUTINE
  ===================================================== */

  const loadCurrentRoutine = () => {
    if (!userId) {
      setRoutine(null);
      setLoading(false);
      return;
    }

    try {
      console.log("=================================");
      console.log("🌿 LOADING CURRENT ROUTINE");
      console.log("USER ID:", userId);

      /* ---------------------------------------------
         FIRST: USER-SPECIFIC ROUTINE
      --------------------------------------------- */

      let savedRoutine = localStorage.getItem(
        `ayurAI_currentRoutine_${userId}`
      );

      console.log(
        "USER-SPECIFIC ROUTINE:",
        savedRoutine
      );

      /* ---------------------------------------------
         SECOND: GENERIC ROUTINE
      --------------------------------------------- */

      if (!savedRoutine) {
        savedRoutine = localStorage.getItem(
          "ayurAI_currentRoutine"
        );

        console.log(
          "GENERIC ROUTINE:",
          savedRoutine
        );
      }

      /* ---------------------------------------------
         NOTHING FOUND
      --------------------------------------------- */

      if (!savedRoutine) {
        console.log(
          "❌ NO CURRENT ROUTINE FOUND"
        );

        setRoutine(null);
        setLoading(false);
        return;
      }

      /* ---------------------------------------------
         PARSE ROUTINE
      --------------------------------------------- */

      const parsedRoutine =
        JSON.parse(savedRoutine);

      console.log(
        "✅ CURRENT ROUTINE FOUND:",
        parsedRoutine
      );

      /* ---------------------------------------------
         CHECK USER
      --------------------------------------------- */

      if (
        parsedRoutine.clerkId &&
        parsedRoutine.clerkId !== userId
      ) {
        console.warn(
          "⚠️ Routine belongs to another user."
        );

        setRoutine(null);
        setLoading(false);
        return;
      }

      setRoutine(parsedRoutine);

    } catch (error) {
      console.error(
        "❌ CURRENT ROUTINE LOAD ERROR:",
        error
      );

      setRoutine(null);

    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    if (!isSignedIn || !userId) {
      setRoutine(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    loadCurrentRoutine();
  }, [userId, isSignedIn]);

  /* =====================================================
     LISTEN FOR CURRENT ROUTINE UPDATE
  ===================================================== */

  useEffect(() => {
    const handleRoutineUpdate = () => {
      console.log(
        "🔄 Current routine update detected"
      );

      setLoading(true);

      setTimeout(() => {
        loadCurrentRoutine();
      }, 100);
    };

    window.addEventListener(
      "ayurAICurrentRoutineUpdated",
      handleRoutineUpdate
    );

    return () => {
      window.removeEventListener(
        "ayurAICurrentRoutineUpdated",
        handleRoutineUpdate
      );
    };
  }, [userId]);

  /* =====================================================
     LISTEN FOR STORAGE CHANGES
  ===================================================== */

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (
        event.key ===
          `ayurAI_currentRoutine_${userId}` ||
        event.key ===
          "ayurAI_currentRoutine"
      ) {
        console.log(
          "🔄 LocalStorage routine changed"
        );

        loadCurrentRoutine();
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, [userId]);

  /* =====================================================
     NOT SIGNED IN
  ===================================================== */

  if (!isSignedIn) {
    return null;
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <section
        id="current-routine"
        className="mx-auto w-full max-w-5xl scroll-mt-32 px-6 py-16"
      >
        <div className="rounded-3xl border border-green-100 bg-white p-10 text-center shadow-lg">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-900 text-2xl text-white">
            🌿
          </div>

          <h3 className="text-xl font-semibold text-green-950">
            Loading your current routine...
          </h3>

          <p className="mt-2 text-gray-600">
            AyurAI is retrieving your active wellness routine.
          </p>

        </div>
      </section>
    );
  }

  /* =====================================================
     NO CURRENT ROUTINE
  ===================================================== */

  if (!routine) {
    return (
      <section
        id="current-routine"
        className="mx-auto w-full max-w-5xl scroll-mt-32 px-6 py-16"
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.5,
          }}
          className="rounded-3xl border border-green-100 bg-white p-10 text-center shadow-lg"
        >

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl">
            🌱
          </div>

          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-green-700">
            My Current Routine
          </p>

          <h2 className="text-3xl font-bold text-green-950">
            No Current Routine Yet
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            Generate a personalized wellness routine
            and select it as your current routine to
            see it here.
          </p>

        </motion.div>
      </section>
    );
  }

  /* =====================================================
     CURRENT ROUTINE FOUND
  ===================================================== */

  return (
    <section
      id="current-routine"
      className="mx-auto w-full max-w-5xl scroll-mt-32 px-6 py-16"
    >

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
        }}
        transition={{
          duration: 0.6,
        }}
        className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-xl"
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="bg-green-900 p-7 text-white">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-green-200">
                AYURAI
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                My Current Routine 🌿
              </h2>

              <p className="mt-2 text-green-100">
                Your active personalized wellness routine.
              </p>

            </div>

            <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              ✓ Active Routine
            </div>

          </div>

        </div>

        {/* =================================================
            DETAILS
        ================================================= */}

        <div className="grid gap-4 border-b border-green-100 bg-green-50/60 p-6 md:grid-cols-3">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
              Goal
            </p>

            <p className="mt-1 font-semibold text-green-950">
              {routine.goal || "Not provided"}
            </p>

          </div>

          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
              Diet
            </p>

            <p className="mt-1 font-semibold text-green-950">
              {routine.diet || "Not provided"}
            </p>

          </div>

          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
              Ayurveda Experience
            </p>

            <p className="mt-1 font-semibold text-green-950">
              {routine.experience || "Not provided"}
            </p>

          </div>

        </div>

        {/* =================================================
            ROUTINE
        ================================================= */}

        <div className="p-7">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-xl">
              🌿
            </div>

            <div>

              <h3 className="text-xl font-bold text-green-950">
                Your Personalized Wellness Plan
              </h3>

              <p className="text-sm text-gray-500">
                Your selected AyurAI routine.
              </p>

            </div>

          </div>

          <div className="rounded-2xl bg-green-50/60 p-6">

            <div className="whitespace-pre-line leading-8 text-gray-700">
              {routine.routine}
            </div>

          </div>

          {/* =================================================
              CREATED DATE
          ================================================= */}

          {routine.createdAt && (
            <div className="mt-5 text-center text-sm text-gray-500">

              Routine created on{" "}

              <span className="font-semibold text-green-800">
                {new Date(
                  routine.createdAt
                ).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>

            </div>
          )}

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="border-t border-green-100 bg-green-50/40 p-5 text-center">

          <p className="text-sm text-gray-600">
            🌱 Follow your routine consistently and
            make wellness a part of your daily journey.
          </p>

        </div>

      </motion.div>

    </section>
  );
}

export default CurrentRoutine;