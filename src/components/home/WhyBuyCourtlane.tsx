const reasons = [
  {
    title: 'Beginner-Friendly Gear',
    description:
      'We focus on essentials that are easy to choose and easy to use, so new players can get on court without overthinking specs.',
  },
  {
    title: 'Straightforward Support',
    description:
      'If you are unsure what to buy, we give clear recommendations for real rec play instead of generic copy-paste answers.',
  },
  {
    title: 'Simple, Fair Pricing',
    description:
      'You get practical pickleball gear at clear prices, without inflated bundles or marketplace noise.',
  },
  {
    title: 'Court-Tested Essentials',
    description:
      'Our lineup is intentionally tight around items everyday players actually use, from starter kits to repeat-purchase basics.',
  },
];

export function WhyBuyCourtlane() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic text-gray-900">
            Why buy from Courtlane?
          </h2>
          <p className="mt-3 text-gray-600 text-base md:text-lg">
            Courtlane is built for beginners and everyday pickleball players who want reliable gear and clear guidance.
            You get practical essentials, fair pricing, and support that helps you choose faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {reasons.map((reason) => (
            <article key={reason.title} className="rounded-sm border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-base font-bold uppercase tracking-wide text-gray-900 mb-2">{reason.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{reason.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
