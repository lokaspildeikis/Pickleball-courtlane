export function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase italic text-gray-900 mb-6">
          Our Story
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We believe the right gear can elevate your game, boost your confidence, and keep you on the court longer.
        </p>
      </div>

      <div className="aspect-video bg-gray-100 rounded-sm overflow-hidden mb-16">
        <img 
          src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&q=80&w=1600" 
          alt="Pickleball net" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="prose prose-lg prose-teal mx-auto text-gray-700">
        <p>
          Courtlane was born out of a simple frustration: finding premium, durable, and stylish pickleball accessories was harder than it needed to be. As passionate players ourselves, we were tired of settling for generic grips that lost their tack after one session, or bulky covers that didn't protect our paddles.
        </p>
        
        <p>
          We set out to create a focused line of essentials—gear that looks as good as it performs. We spent months testing materials, refining designs, and gathering feedback from players of all levels, from weekend warriors to tournament pros.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Built for the Modern Player</h2>
        
        <p>
          Our philosophy is simple: quality over quantity. We don't sell everything; we only sell what we believe is the best. Whether it's our ultra-tacky overgrips that keep your hand secure in the summer heat, or our shock-absorbing neoprene covers that protect your investment, every Courtlane product is designed with intention.
        </p>

        <p>
          We are proud to be a part of the fastest-growing sport in America, and we are committed to supporting the community that makes pickleball so special. See you on the courts.
        </p>
      </div>
    </div>
  );
}
