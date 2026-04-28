import { Link } from "react-router-dom";
import { ABOUT_PAGE } from "../lib/brandContent";
import { SUPPORT_EMAIL } from "../lib/trustContent";
import { Button } from "../components/ui/Button";
import { PageMeta } from "../components/seo/PageMeta";

export function About() {
  const { meta, intro, story, focus, trust, proof, closing, heroImage } = ABOUT_PAGE;

  return (
    <>
      <PageMeta title={meta.title} description={meta.description} canonicalPath="/about" />

      <div className="bg-white">
        {/* Section 1 — intro + primary CTAs */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-12 md:pb-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-800 mb-3">About Courtlane</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase italic text-gray-900 mb-5 leading-tight">
            {intro.headline}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
            {intro.subheading}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            <Link to={intro.ctaPrimary.href} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                {intro.ctaPrimary.label}
              </Button>
            </Link>
            <Link
              to={intro.ctaSecondary.href}
              className="inline-flex items-center justify-center min-h-14 px-6 text-base font-semibold text-teal-800 border-2 border-teal-800 rounded-sm hover:bg-teal-50 transition-colors"
            >
              {intro.ctaSecondary.label}
            </Link>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="aspect-video bg-gray-100 rounded-sm overflow-hidden mb-12 md:mb-16">
            <img
              src={heroImage.src}
              alt={heroImage.alt}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Section 2 — story */}
        <section
          aria-labelledby="about-story-heading"
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 md:pb-16"
        >
          <h2 id="about-story-heading" className="sr-only">
            Our story
          </h2>
          <div className="space-y-5 text-gray-700 text-base md:text-lg leading-relaxed">
            {story.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        {/* Section 3 — what we focus on */}
        <section
          aria-labelledby="about-focus-heading"
          className="bg-gray-50 border-y border-gray-100 py-12 md:py-16"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              id="about-focus-heading"
              className="text-2xl font-black tracking-tight uppercase italic text-gray-900 mb-6"
            >
              {focus.title}
            </h2>
            <ul className="grid gap-3 sm:gap-4">
              {focus.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 items-start bg-white border border-gray-200 rounded-sm px-4 py-3 text-gray-700 text-sm md:text-base"
                >
                  <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-teal-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Optional proof — practical reasons, no fake stats */}
        <section
          aria-labelledby="about-proof-heading"
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16"
        >
          <h2
            id="about-proof-heading"
            className="text-xl md:text-2xl font-bold text-gray-900 mb-4"
          >
            {proof.title}
          </h2>
          <ul className="space-y-3 text-gray-600 leading-relaxed">
            {proof.points.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="text-teal-700 font-bold" aria-hidden>
                  ·
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 4 — trust */}
        <section
          aria-labelledby="about-trust-heading"
          className="bg-teal-950 text-teal-50 py-12 md:py-16"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              id="about-trust-heading"
              className="text-2xl font-black tracking-tight uppercase italic text-white mb-4"
            >
              {trust.title}
            </h2>
            <p className="text-teal-100/95 leading-relaxed mb-6">
              {trust.body}{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-white font-medium underline underline-offset-2 hover:text-teal-200"
              >
                {SUPPORT_EMAIL}
              </a>
              —we’ll reply in plain language.
            </p>
            <nav aria-label="Policies and help" className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
              {trust.links.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  className="text-teal-200 hover:text-white underline underline-offset-2"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </section>

        {/* Section 5 — closing CTA */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase italic text-gray-900 mb-3">
            {closing.title}
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">{closing.body}</p>
          <p className="text-sm text-gray-600 mb-5">
            New to the game? Start with a <Link to="/shop?filter=bundles" className="text-teal-700 font-semibold hover:underline">beginner pickleball starter bundle</Link>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center flex-wrap">
            <Link to={closing.primary.href}>
              <Button size="lg">{closing.primary.label}</Button>
            </Link>
            {closing.secondary.map((link) =>
              link.href.startsWith("mailto:") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-teal-800 font-semibold hover:underline underline-offset-2 min-h-11 inline-flex items-center"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-teal-800 font-semibold hover:underline underline-offset-2 min-h-11 inline-flex items-center"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        </section>
      </div>
    </>
  );
}
