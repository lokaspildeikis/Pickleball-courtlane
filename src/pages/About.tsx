export function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase italic text-gray-900 mb-6">
          Our story
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Courtlane exists to make pickleball shopping simpler for people who just want to play—especially beginners and everyday rec players.
        </p>
      </div>

      <div className="aspect-video bg-gray-100 rounded-sm overflow-hidden mb-16">
        <img
          src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&q=80&w=1600"
          alt="Pickleball court"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="prose prose-lg prose-teal mx-auto text-gray-700">
        <p>
          Pickleball gear can be noisy—long listings, overlapping specs, and copy that reads like it was meant for a wholesale catalog. We wanted the opposite: a tight selection of essentials and descriptions written for real court use.
        </p>

        <p>
          Courtlane focuses on balls, paddles, covers, bags, grips, towels, and small accessories you actually reach for between sessions. We keep the tone practical, skip hype, and point you to our shipping and returns pages when policies matter more than marketing.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Who we are for</h2>

        <p>
          If you are new to the sport, play a few times a week, or shop for someone who does, you are the audience we built this for. We are not trying to sound like a luxury trophy shop—we are trying to sound like a helpful local court desk with a clear website.
        </p>

        <p>
          Questions before you buy? Email us—we would rather answer plainly than leave you guessing.
        </p>
      </div>
    </div>
  );
}
