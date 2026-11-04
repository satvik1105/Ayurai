
import { Leaf, ArrowUpRight, Heart } from "lucide-react";

const Footer = () => {
  const handleJourneyClick = () => {
    window.dispatchEvent(new Event("navigateAyurAIJourney"));
  };

  const handleHomeClick = () => {
    window.dispatchEvent(new Event("navigateAyurAIHome"));
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-[#dfe4d7] bg-[#eee8d9] text-[#294b35]">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#dce6d4]/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#d8dfc9]/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 pb-7 pt-14 sm:px-10 sm:pt-16 lg:px-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-12 border-b border-[#d4d9ca] pb-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">

          {/* Brand section */}
          <div className="lg:col-span-2">
            <a
              href="#home"
              onClick={handleHomeClick}
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#244b34] text-[#f6f2e8] shadow-md">
                <Leaf size={25} strokeWidth={1.8} />
              </div>

              <span className="text-2xl font-semibold tracking-tight text-[#21462f]">
                AyurAI
              </span>
            </a>

            <h3 className="mt-7 max-w-md font-serif text-3xl leading-tight text-[#244b34] sm:text-4xl">
              Find your balance.
              <span className="block italic text-[#71866b]">
                Feel your best.
              </span>
            </h3>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#687767]">
              Discover a more mindful way of living with personalized
              wellness guidance inspired by Ayurveda and powered by AI.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#d5ddce] bg-[#f7f5ed]/80 px-4 py-2 text-xs font-medium text-[#557253]">
              <Leaf size={14} />
              Wellness, naturally.
            </div>
          </div>

          {/* Explore links */}
          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-[0.16em] text-[#31563b]">
              Explore
            </h4>

            <ul className="space-y-4">
              <li>
                <a
                  href="#home"
                  onClick={handleHomeClick}
                  className="group inline-flex items-center gap-2 text-sm text-[#687767] transition hover:text-[#244b34]"
                >
                  Home
                  <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" />
                </a>
              </li>

              <li>
                <a
                  href="#ayurveda"
                  className="group inline-flex items-center gap-2 text-sm text-[#687767] transition hover:text-[#244b34]"
                >
                  Ayurvedic Wisdom
                  <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" />
                </a>
              </li>

              <li>
                <a
                  href="#ai-wellness"
                  className="group inline-flex items-center gap-2 text-sm text-[#687767] transition hover:text-[#244b34]"
                >
                  AI Wellness
                  <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" />
                </a>
              </li>

              <li>
                <a
                  href="#articles"
                  className="group inline-flex items-center gap-2 text-sm text-[#687767] transition hover:text-[#244b34]"
                >
                  Wellness Articles
                  <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" />
                </a>
              </li>
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-[0.16em] text-[#31563b]">
              Your Wellness
            </h4>

            <ul className="space-y-4">
              <li>
                <button
                  type="button"
                  onClick={handleJourneyClick}
                  className="group inline-flex items-center gap-2 text-sm text-[#687767] transition hover:text-[#244b34]"
                >
                  My Journey
                  <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" />
                </button>
              </li>

              <li>
                <a
                  href="#ai-wellness"
                  className="group inline-flex items-center gap-2 text-sm text-[#687767] transition hover:text-[#244b34]"
                >
                  Build My Routine
                  <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" />
                </a>
              </li>

              <li>
                <a
                  href="#home"
                  onClick={handleHomeClick}
                  className="group inline-flex items-center gap-2 text-sm text-[#687767] transition hover:text-[#244b34]"
                >
                  Back to Home
                  <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 rounded-2xl border border-[#d8dece] bg-[#f5f2e9]/80 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e5ebdf] text-[#527557]">
              <Leaf size={18} />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#31563b]">
                A Gentle Wellness Reminder
              </h4>

              <p className="mt-2 text-xs leading-6 text-[#748071] sm:text-sm">
                AyurAI provides AI-generated wellness information for
                general educational purposes only. It is not a substitute
                for professional medical advice, diagnosis, or treatment.
                Consult a qualified healthcare professional for personal
                medical concerns.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 pt-7 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-[#788273]">
            © {currentYear} AyurAI. All rights reserved.
          </p>

          <p className="inline-flex items-center gap-1.5 text-xs text-[#788273]">
            Made with
            <Heart size={13} className="fill-[#8b9b79] text-[#8b9b79]" />
            for mindful living
          </p>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="rounded-full border border-[#d4ddce] bg-[#f7f5ed] px-4 py-2 text-xs font-semibold text-[#31563b] transition hover:bg-[#e4ebdf]"
          >
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
