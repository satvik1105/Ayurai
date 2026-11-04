
import { useState } from "react";
import { ArrowLeft, ArrowRight, Leaf } from "lucide-react";

const articles = [
  {
    id: 1,
    title: "Understanding Ayurveda",
    description: "A simple introduction to traditional Ayurvedic wellness.",
    image:
      "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800&q=80",
    content:
      "Ayurveda is a traditional system of wellness that emphasizes daily habits, balance and individual needs. You can explore its concepts while keeping healthy routines, balanced meals and professional medical guidance in mind.",
  },
  {
    id: 2,
    title: "Healthy Morning Habits",
    description: "Simple habits to start your day on a positive note.",
    image:
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80",
    content:
      "Start your morning with a consistent wake-up time, a glass of water if suitable for you, and a few minutes of gentle movement. Plan your priorities and build habits gradually instead of trying to change everything at once.",
  },
  {
    id: 3,
    title: "Healthy Eating",
    description: "Everyday ideas for balanced and mindful meals.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
    content:
      "Balanced eating can include vegetables, fruits, grains, protein-rich foods and healthy fats. Eat a variety of foods that suit your needs, enjoy your meals without rushing and stay hydrated throughout the day.",
  },
  {
    id: 4,
    title: "Stress & Relaxation",
    description: "Small ways to make time for yourself.",
    image:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80",
    content:
      "Take short breaks, try comfortable breathing exercises, spend time outdoors or talk to someone you trust. Small, consistent habits can support everyday wellbeing. If stress becomes overwhelming, consider speaking with a qualified professional.",
  },
];

export default function Home() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <section className="bg-[#f3ebdd] px-5 py-12 text-[#263d2b] sm:px-8">
      <div className="mx-auto max-w-6xl">
        {selectedArticle ? (
          <div className="mx-auto max-w-3xl">
            <button
              onClick={() => setSelectedArticle(null)}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#345b3b] hover:underline"
            >
              <ArrowLeft size={17} />
              Back to Articles
            </button>

            <img
              src={selectedArticle.image}
              alt={selectedArticle.title}
              className="mb-6 h-64 w-full rounded-2xl object-cover"
            />

            <h2 className="text-3xl font-semibold">
              {selectedArticle.title}
            </h2>

            <p className="mt-4 text-base leading-8 text-[#666858]">
              {selectedArticle.content}
            </p>

            <p className="mt-6 rounded-xl bg-[#e8e8d9] p-4 text-sm leading-6 text-[#666858]">
              This article provides general wellness information
              and is not a substitute for professional medical advice.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#587052]">
                <Leaf size={15} />
                AYURAI JOURNAL
              </p>

              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Wellness & Ayurveda
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#777565] sm:text-base">
                Simple tips for a healthier everyday life.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="overflow-hidden rounded-2xl border border-[#e1d9c9] bg-[#fffcf5] transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    className="h-44 w-full object-cover"
                  />

                  <div className="p-5">
                    <h3 className="text-lg font-semibold">
                      {article.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#777565]">
                      {article.description}
                    </p>

                    <button
                      onClick={() => setSelectedArticle(article)}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#345b3b] hover:gap-3"
                    >
                      Read More
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
