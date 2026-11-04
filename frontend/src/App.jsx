
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AIPersonalization from "./components/AIPersonalization";
import PersonalizedRoutine from "./components/PersonalizedRoutine";
import AyurvedicWisdom from "./components/AyurvedicWisdom";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import MyJourney from "./pages/MyJourney";
import AIChat from "./pages/AIChat";

function App() {
  const [selectedGoal, setSelectedGoal] = useState(null);

  const [answers, setAnswers] = useState({
    answer1: "",
    answer2: "",
  });

  const [currentPage, setCurrentPage] = useState(
    window.location.hash === "#ayurai-chat" ? "chat" : "home"
  );

  const [saveStatus, setSaveStatus] = useState("");

  const { getToken, isSignedIn, userId } = useAuth();

  // Browser and application navigation
  useEffect(() => {
    const scrollTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    const openJourney = () => {
      setCurrentPage("journey");
      scrollTop();
    };

    const openHome = () => {
      if (window.location.hash === "#ayurai-chat") {
        window.history.replaceState(
          { page: "home" },
          "",
          window.location.pathname + window.location.search
        );
      }

      setCurrentPage("home");
      scrollTop();
    };

    const openChat = () => {
      if (window.location.hash !== "#ayurai-chat") {
        window.history.pushState(
          { page: "chat" },
          "",
          "#ayurai-chat"
        );
      }

      setCurrentPage("chat");
      scrollTop();
    };

    // Handle Chrome Back and Forward buttons
    const handleBrowserNavigation = () => {
      if (window.location.hash === "#ayurai-chat") {
        setCurrentPage("chat");
      } else {
        setCurrentPage("home");
      }

      scrollTop();
    };

    window.addEventListener(
      "navigateAyurAIJourney",
      openJourney
    );

    window.addEventListener(
      "navigateAyurAIHome",
      openHome
    );

    window.addEventListener(
      "navigateAyurAIChat",
      openChat
    );

    window.addEventListener(
      "navigateAyurAIChatbot",
      openChat
    );

    window.addEventListener(
      "popstate",
      handleBrowserNavigation
    );

    return () => {
      window.removeEventListener(
        "navigateAyurAIJourney",
        openJourney
      );

      window.removeEventListener(
        "navigateAyurAIHome",
        openHome
      );

      window.removeEventListener(
        "navigateAyurAIChat",
        openChat
      );

      window.removeEventListener(
        "navigateAyurAIChatbot",
        openChat
      );

      window.removeEventListener(
        "popstate",
        handleBrowserNavigation
      );
    };
  }, []);

  // Get selected wellness goal
  const getGoalValue = () => {
    if (!selectedGoal) return "";

    if (typeof selectedGoal === "string") {
      return selectedGoal;
    }

    return (
      selectedGoal.title ||
      selectedGoal.name ||
      selectedGoal.id ||
      ""
    );
  };

  // Save personalization data
  useEffect(() => {
    const saveUserData = async () => {
      if (!isSignedIn || !userId) return;

      const goal = getGoalValue();

      if (
        !goal ||
        !answers.answer1 ||
        !answers.answer2
      ) {
        return;
      }

      try {
        setSaveStatus("Saving your personalization...");

        let token = "";

        try {
          token = await getToken();
        } catch (tokenError) {
          console.warn(
            "Could not get Clerk token:",
            tokenError
          );
        }

        const response = await fetch(
          "https://ayurai-backend-u1e8.onrender.com/api/user",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
            body: JSON.stringify({
              clerkId: userId,
              goal,
              answer1: answers.answer1,
              answer2: answers.answer2,
            }),
          }
        );

        let data;

        try {
          data = await response.json();
        } catch {
          throw new Error(
            "Backend returned an invalid response."
          );
        }

        console.log("DATABASE RESPONSE:", data);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Failed to save user data."
          );
        }

        if (data?.success) {
          setSaveStatus(
            "Personalization saved successfully ✅"
          );
        } else {
          setSaveStatus(
            "Unable to save personalization ❌"
          );
        }
      } catch (error) {
        console.error(
          "DATABASE SAVE ERROR:",
          error
        );

        setSaveStatus(
          error?.message || "Database error ❌"
        );
      }
    };

    saveUserData();
  }, [
    selectedGoal,
    answers.answer1,
    answers.answer2,
    isSignedIn,
    userId,
    getToken,
  ]);

  // Open AyurAI and add browser history entry
  const openAyurAI = () => {
    if (window.location.hash !== "#ayurai-chat") {
      window.history.pushState(
        { page: "chat" },
        "",
        "#ayurai-chat"
      );
    }

    setCurrentPage("chat");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Close AyurAI using browser history
  const closeAyurAI = () => {
    if (window.location.hash === "#ayurai-chat") {
      window.history.back();
    } else {
      setCurrentPage("home");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f3ebdd]">
      {currentPage !== "chat" && <Navbar />}

      {currentPage === "home" ? (
        <>
          <div
            id="home"
            className="scroll-mt-32"
          >
            <Hero
              selectedGoal={selectedGoal}
              setSelectedGoal={setSelectedGoal}
              onAskAyurAI={openAyurAI}
            />
          </div>

          <div
            id="ayurveda"
            className="scroll-mt-32"
          >
            <AyurvedicWisdom
              selectedGoal={selectedGoal}
            />
          </div>

          <div
            id="ai-wellness"
            className="scroll-mt-32"
          >
            <AIPersonalization
              selectedGoal={selectedGoal}
              setAnswers={setAnswers}
            />

            <PersonalizedRoutine
              selectedGoal={selectedGoal}
              answer1={answers.answer1}
              answer2={answers.answer2}
            />
          </div>

          <div
            id="articles"
            className="scroll-mt-32"
          >
            <Home
              selectedGoal={selectedGoal}
              setSelectedGoal={setSelectedGoal}
            />
          </div>
        </>
      ) : currentPage === "journey" ? (
        <MyJourney />
      ) : currentPage === "chat" ? (
        <AIChat
          clerkId={userId}
          getToken={getToken}
          onClose={closeAyurAI}
        />
      ) : null}

      {currentPage !== "chat" && <Footer />}

      {saveStatus && currentPage !== "chat" && (
        <div className="fixed bottom-5 right-5 z-[100]">
          <div className="rounded-2xl border border-green-100 bg-white px-5 py-3 shadow-2xl">
            <p className="text-sm font-semibold text-green-900">
              {saveStatus}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
