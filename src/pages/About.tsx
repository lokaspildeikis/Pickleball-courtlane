import { Link } from 'react-router-dom';
import { PageMeta } from '../components/seo/PageMeta';
import { SUPPORT_EMAIL } from '../lib/trustContent';

export function About() {
  return (
    <>
      <PageMeta
        title="Our Story | Courtlane"
        description="Hi, I'm Rokas — the founder of Courtlane. Here's why I built a pickleball shop focused on honest gear at fair prices."
        canonicalPath="/our-story"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">

        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-800 mb-3">About Courtlane</p>
          <h1 className="text-4xl font-black tracking-tight uppercase italic text-gray-900">
            Our Story
          </h1>
        </div>

        {/* TODO: Founder photo goes here */}
        <div className="mx-auto w-full max-w-[400px] aspect-square bg-gray-100 rounded-sm mb-12 flex items-center justify-center text-gray-400 text-sm border border-gray-200">
          Photo of Rokas · ~400 × 400 px
        </div>

        <div className="space-y-5 text-gray-700 text-base md:text-lg leading-relaxed">
          <p>Hi, I'm Rokas — the founder of Courtlane.</p>

          <p>I started Courtlane because of a problem I ran into myself.</p>

          <p>
            When I got into pickleball, I went looking for gear and hit a wall. Everywhere I looked,
            the options were either ultra-premium paddle sets at $200+ or sketchy knockoff stuff that
            wouldn't last a week. There was no middle ground — no place that just sold solid,
            beginner-friendly gear without making you feel like you needed to be a pro to deserve it.
          </p>

          <p>So I built one.</p>

          <p>
            Courtlane is the shop I wished existed when I started. Honest descriptions,
            USAPA-approved equipment, prices that don't gatekeep the sport. Whether you're picking up
            a paddle for the first time or you've been playing for years and want a clean second set,
            you'll find something here.
          </p>

          <p>
            When I'm not figuring out which paddles to add to the lineup, you'll usually find me at
            a race track. Cars are my other obsession — same idea, really. Gear matters, but only if
            it's the right gear for what you're actually doing.
          </p>

          <p>
            Thanks for stopping by. If you've ever got a question, email me at{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-teal-700 font-medium hover:underline underline-offset-2"
            >
              {SUPPORT_EMAIL}
            </a>{' '}
            — that inbox comes to me directly.
          </p>

          <p className="italic text-gray-500">— Rokas</p>
        </div>

        <div className="mt-14 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center h-11 px-6 font-medium bg-teal-800 text-white hover:bg-teal-900 rounded-sm transition-colors text-sm"
          >
            Shop the gear
          </Link>
          <Link
            to="/faq"
            className="inline-flex items-center justify-center h-11 px-6 font-medium text-teal-800 border border-teal-800 hover:bg-teal-50 rounded-sm transition-colors text-sm"
          >
            Read the FAQ
          </Link>
        </div>

      </div>
    </>
  );
}
