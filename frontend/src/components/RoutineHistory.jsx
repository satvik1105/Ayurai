import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { Heart, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

const RoutineMarkdown = ({ content }) => {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h2 className="mb-4 mt-7 text-2xl font-bold tracking-tight text-[#244b34]">
            {children}
          </h2>
        ),

        h2: ({ children }) => (
          <h3 className="mb-4 mt-7 border-b border-[#dce5d6] pb-2 text-xl font-bold text-[#31563b]">
            {children}
          </h3>
        ),

        h3: ({ children }) => (
          <h4 className="mb-3 mt-5 text-lg font-semibold text-[#31563b]">
            {children}
          </h4>
        ),

        p: ({ children }) => (
          <p className="mb-4 text-sm leading-8 text-[#59685b] sm:text-base">
            {children}
          </p>
        ),

        strong: ({ children }) => (
          <strong className="font-bold text-[#294b35]">
            {children}
          </strong>
        ),

        ul: ({ children }) => (
          <ul className="mb-5 ml-5 list-disc space-y-2 text-sm leading-7 text-[#59685b] sm:text-base">
            {children}
          </ul>
        ),

        ol: ({ children }) => (
          <ol className="mb-5 ml-5 list-decimal space-y-2 text-sm leading-7 text-[#59685b] sm:text-base">
            {children}
          </ol>
        ),

        li: ({ children }) => (
          <li className="pl-1 marker:text-[#78936e]">
            {children}
          </li>
        ),

        blockquote: ({ children }) => (
          <blockquote className="my-5 border-l-4 border-[#9aaf89] bg-[#edf2e8] px-5 py-3 text-[#526b54]">
            {children}
          </blockquote>
        ),

        hr: () => (
          <hr className="my-6 border-[#dce5d6]" />
        ),
      }}
    >
      {content || ""}
    </ReactMarkdown>
  );
};

function RoutineHistory() {
  const { userId, isSignedIn } = useAuth();

  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [wishlistOpen, setWishlistOpen] = useState(false);

  /* =====================================================
     FETCH ROUTINES
  ===================================================== */

  const fetchRoutineHistory = async () => {
    if (!isSignedIn || !userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/routines/${userId}`
      );

      const data = await response.json();

      console.log("Routine history:", data);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to fetch routines"
        );
      }

      setRoutines(data.routines || []);

    } catch (err) {
      console.error(
        "Routine history error:",
        err
      );

      setError(
        err.message ||
          "Unable to load routine history."
      );

    } finally {
      setLoading(false);
    }
  };


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchRoutineHistory();
  }, [userId, isSignedIn]);


  /* =====================================================
     REFRESH HISTORY WHEN A NEW ROUTINE IS SAVED
  ===================================================== */

  useEffect(() => {
    const handleRoutinesUpdated = () => {
      fetchRoutineHistory();
    };

    window.addEventListener(
      "ayurAI:routines-updated",
      handleRoutinesUpdated
    );

    return () => {
      window.removeEventListener(
        "ayurAI:routines-updated",
        handleRoutinesUpdated
      );
    };
  }, [userId, isSignedIn]);


  /* =====================================================
     NAVBAR WISHLIST EVENT
  ===================================================== */

  useEffect(() => {
    const openWishlist = () => {
      setWishlistOpen(true);
    };

    window.addEventListener(
      "openAyurAIWishlist",
      openWishlist
    );

    return () => {
      window.removeEventListener(
        "openAyurAIWishlist",
        openWishlist
      );
    };
  }, []);


  /* =====================================================
     CLOSE WISHLIST
  ===================================================== */

  const closeWishlist = () => {
    setWishlistOpen(false);
  };


  /* =====================================================
     TOGGLE WISHLIST
  ===================================================== */

  const toggleWishlist = async (routine) => {

    try {

      const newFavorite =
        !routine.isFavorite;

      console.log(
        "Updating wishlist:",
        routine.id,
        newFavorite
      );

      const response = await fetch(
        `http://localhost:5000/api/routines/${userId}/favorites`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            routineId: routine.id,
            favorite: newFavorite,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "Wishlist response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to update wishlist"
        );
      }

      /* ---------------------------------------------
         UPDATE LOCAL STATE
      --------------------------------------------- */

      setRoutines((prev) =>
        prev.map((item) =>
          item.id === routine.id
            ? {
                ...item,
                isFavorite:
                  newFavorite,
              }
            : item
        )
      );

    } catch (err) {

      console.error(
        "Wishlist error:",
        err
      );

      alert(
        err.message ||
          "Unable to update wishlist."
      );
    }
  };


  /* =====================================================
     IF NOT SIGNED IN
  ===================================================== */

  if (!isSignedIn) {
    return null;
  }


  /* =====================================================
     WISHLIST ROUTINES
  ===================================================== */

  const wishlistRoutines =
    routines.filter(
      (item) => item.isFavorite === true
    );


  return (
    <>
      {/* =================================================
          ROUTINE HISTORY
      ================================================= */}

      <section
        className="
          mx-auto
          w-full
          max-w-5xl
          px-6
          py-16
        "
      >

        {/* HEADER */}

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
          className="mb-10 text-center"
        >

          <p
            className="
              mb-2
              text-sm
              font-semibold
              uppercase
              tracking-wider
              text-green-700
            "
          >
            AyurAI History
          </p>

          <h2
            className="
              text-3xl
              font-bold
              text-green-950
            "
          >
            Your Wellness Journey
          </h2>

          <p
            className="
              mx-auto
              mt-3
              max-w-2xl
              text-gray-600
            "
          >
            View the personalized wellness
            routines you have created with AyurAI.
          </p>

        </motion.div>


        {/* LOADING */}

        {loading && (

          <div
            className="
              rounded-3xl
              border
              border-green-100
              bg-white
              p-10
              text-center
              shadow-lg
            "
          >

            <div
              className="
                mx-auto
                mb-4
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-green-900
                text-2xl
                text-white
              "
            >
              🌿
            </div>

            <h3
              className="
                text-xl
                font-semibold
                text-green-950
              "
            >
              Loading your wellness history...
            </h3>

          </div>

        )}


        {/* ERROR */}

        {!loading && error && (

          <div
            className="
              rounded-3xl
              border
              border-red-100
              bg-white
              p-10
              text-center
              shadow-lg
            "
          >

            <div className="mb-4 text-4xl">
              ⚠️
            </div>

            <h3
              className="
                text-xl
                font-semibold
                text-red-700
              "
            >
              Unable to load history
            </h3>

            <p className="mt-2 text-gray-600">
              {error}
            </p>

          </div>

        )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          routines.length === 0 && (

            <div
              className="
                rounded-3xl
                border
                border-green-100
                bg-white
                p-10
                text-center
                shadow-lg
              "
            >

              <div className="mb-4 text-5xl">
                🌱
              </div>

              <h3
                className="
                  text-xl
                  font-semibold
                  text-green-950
                "
              >
                No routines yet
              </h3>

              <p className="mt-2 text-gray-600">
                Generate your first personalized
                wellness routine and it will appear here.
              </p>

            </div>

          )}


        {/* ROUTINE LIST */}

        {!loading &&
          !error &&
          routines.length > 0 && (

            <div className="space-y-6">

              {routines.map(
                (item, index) => (

                  <motion.div
                    key={item.id}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.4,
                      delay:
                        index * 0.05,
                    }}
                    className="
                      overflow-hidden
                      rounded-3xl
                      border
                      border-green-100
                      bg-white
                      shadow-lg
                    "
                  >

                    {/* HEADER */}

                    <div
                      className="
                        bg-green-900
                        p-6
                        text-white
                      "
                    >

                      <div
                        className="
                          flex
                          flex-col
                          gap-4
                          md:flex-row
                          md:items-center
                          md:justify-between
                        "
                      >

                        <div>

                          <p
                            className="
                              text-xs
                              font-semibold
                              uppercase
                              tracking-wider
                              text-green-200
                            "
                          >
                            AyurAI Wellness Routine
                          </p>

                          <h3
                            className="
                              mt-1
                              text-2xl
                              font-bold
                            "
                          >
                            {item.goal}
                          </h3>

                        </div>

                        <div
                          className="
                            text-sm
                            text-green-100
                          "
                        >
                          {new Date(
                            item.createdAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </div>

                      </div>

                    </div>


                    {/* DETAILS */}

                    <div
                      className="
                        grid
                        gap-4
                        border-b
                        border-green-100
                        bg-green-50/60
                        p-6
                        md:grid-cols-2
                      "
                    >

                      <div>

                        <p
                          className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wide
                            text-green-700
                          "
                        >
                          Diet
                        </p>

                        <p
                          className="
                            mt-1
                            font-semibold
                            text-green-950
                          "
                        >
                          {item.diet ||
                            "Not provided"}
                        </p>

                      </div>


                      <div>

                        <p
                          className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wide
                            text-green-700
                          "
                        >
                          Ayurveda Experience
                        </p>

                        <p
                          className="
                            mt-1
                            font-semibold
                            text-green-950
                          "
                        >
                          {item.experience ||
                            "Beginner"}
                        </p>

                      </div>

                    </div>


                    {/* ROUTINE */}

                    <div className="p-6">

                      <div
                        className="
                          mb-4
                          flex
                          items-center
                          gap-2
                        "
                      >

                        <span className="text-xl">
                          🌿
                        </span>

                        <h4
                          className="
                            text-lg
                            font-bold
                            text-green-950
                          "
                        >
                          Personalized Routine
                        </h4>

                      </div>


                      <div
                        className="
                          rounded-2xl
                          bg-green-50/50
                          p-5
                        "
                      >

                        <div className="rounded-2xl bg-[#f6faf5] p-5 sm:p-7">
  <RoutineMarkdown content={item.routine} />
</div>

                      </div>


                      {/* WISHLIST BUTTON */}

                      <div
                        className="
                          mt-6
                          flex
                          justify-end
                        "
                      >

                        <button
                          type="button"
                          onClick={() =>
                            toggleWishlist(item)
                          }
                          className={`
                            flex
                            items-center
                            gap-2
                            rounded-xl
                            px-5
                            py-3
                            text-sm
                            font-semibold
                            transition
                            ${
                              item.isFavorite
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-900 text-white hover:bg-green-800"
                            }
                          `}
                        >

                          <Heart
                            size={18}
                            fill={
                              item.isFavorite
                                ? "currentColor"
                                : "none"
                            }
                          />

                          {item.isFavorite
                            ? "Saved to Wishlist"
                            : "Add to Wishlist"}

                        </button>

                      </div>

                    </div>

                  </motion.div>

                )
              )}

            </div>

          )}

      </section>


      {/* =================================================
          WISHLIST MODAL
      ================================================= */}

      {wishlistOpen && (

        <div
          className="
            fixed
            inset-0
            z-[200]
            flex
            items-center
            justify-center
            bg-black/40
            px-4
            backdrop-blur-sm
          "
          onClick={closeWishlist}
        >

          <div
            className="
              relative
              max-h-[85vh]
              w-full
              max-w-3xl
              overflow-y-auto
              rounded-3xl
              bg-[#f6f3ea]
              p-6
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              onClick={closeWishlist}
              className="
                absolute
                right-5
                top-5
                rounded-full
                bg-white
                p-2
                text-gray-600
                shadow
                transition
                hover:bg-green-100
                hover:text-green-900
              "
            >
              <X size={20} />
            </button>


            {/* MODAL HEADER */}

            <div className="mb-6 pr-10">

              <p
                className="
                  text-sm
                  font-semibold
                  uppercase
                  tracking-wider
                  text-green-700
                "
              >
                AyurAI
              </p>

              <h2
                className="
                  mt-1
                  text-3xl
                  font-bold
                  text-green-950
                "
              >
                My Wishlist
              </h2>

              <p className="mt-2 text-gray-600">
                Your saved wellness routines.
              </p>

            </div>


            {/* EMPTY WISHLIST */}

            {wishlistRoutines.length === 0 && (

              <div
                className="
                  rounded-2xl
                  bg-white
                  p-10
                  text-center
                "
              >

                <Heart
                  size={42}
                  className="
                    mx-auto
                    mb-4
                    text-green-700
                  "
                />

                <h3
                  className="
                    text-xl
                    font-semibold
                    text-green-950
                  "
                >
                  Your wishlist is empty
                </h3>

                <p className="mt-2 text-gray-600">
                  Save routines you want to
                  revisit later.
                </p>

              </div>

            )}


            {/* WISHLIST ITEMS */}

            {wishlistRoutines.length > 0 && (

              <div className="space-y-5">

                {wishlistRoutines.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-green-100
                        bg-white
                        shadow-sm
                      "
                    >

                      {/* ITEM HEADER */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          bg-green-900
                          px-5
                          py-4
                          text-white
                        "
                      >

                        <div>

                          <p
                            className="
                              text-xs
                              uppercase
                              tracking-wider
                              text-green-200
                            "
                          >
                            Saved Routine
                          </p>

                          <h3
                            className="
                              text-xl
                              font-bold
                            "
                          >
                            {item.goal}
                          </h3>

                        </div>


                        {/* REMOVE */}

                        <button
                          type="button"
                          onClick={() =>
                            toggleWishlist(item)
                          }
                          className="
                            rounded-full
                            p-2
                            text-white
                            transition
                            hover:bg-white/10
                          "
                          title="Remove from wishlist"
                        >

                          <Heart
                            size={21}
                            fill="currentColor"
                          />

                        </button>

                      </div>


                      {/* ITEM DETAILS */}

                      <div className="p-5">

                        <div
                          className="
                            mb-4
                            grid
                            gap-3
                            md:grid-cols-2
                          "
                        >

                          <div
                            className="
                              rounded-xl
                              bg-green-50
                              p-4
                            "
                          >

                            <p
                              className="
                                text-xs
                                font-semibold
                                uppercase
                                text-green-700
                              "
                            >
                              Diet
                            </p>

                            <p
                              className="
                                mt-1
                                font-semibold
                                text-green-950
                              "
                            >
                              {item.diet ||
                                "Not provided"}
                            </p>

                          </div>


                          <div
                            className="
                              rounded-xl
                              bg-green-50
                              p-4
                            "
                          >

                            <p
                              className="
                                text-xs
                                font-semibold
                                uppercase
                                text-green-700
                              "
                            >
                              Ayurveda Experience
                            </p>

                            <p
                              className="
                                mt-1
                                font-semibold
                                text-green-950
                              "
                            >
                              {item.experience ||
                                "Beginner"}
                            </p>

                          </div>

                        </div>


                        <div className="rounded-2xl bg-[#f6faf5] p-5 sm:p-7">
  <RoutineMarkdown content={item.routine} />
</div>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

      )}

    </>
  );
}

export default RoutineHistory;