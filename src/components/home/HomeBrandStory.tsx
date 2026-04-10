import { Link } from "react-router-dom";
import { HOME_BRAND_STORY } from "../../lib/brandContent";
import { Button } from "../ui/Button";

/** Short homepage credibility block — copy lives in `lib/brandContent.ts`. */
export function HomeBrandStory() {
  const { heading, paragraphs, readMoreLabel, readMoreHref, shopCtaLabel, shopHref } = HOME_BRAND_STORY;

  return (
    <section className="py-12 md:py-16 bg-gray-50 border-y border-gray-200" aria-labelledby="home-brand-story-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2
            id="home-brand-story-heading"
            className="text-2xl md:text-3xl font-black tracking-tight uppercase italic text-gray-900 mb-4"
          >
            {heading}
          </h2>
          <div className="space-y-4 text-gray-600 text-base md:text-lg leading-relaxed mb-8">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Link to={readMoreHref} className="text-teal-800 font-bold text-sm uppercase tracking-wide hover:underline underline-offset-4 order-2 sm:order-1">
              {readMoreLabel} →
            </Link>
            <Link to={shopHref} className="order-1 sm:order-2 w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                {shopCtaLabel}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
