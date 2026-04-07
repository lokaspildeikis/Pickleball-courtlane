export function Returns() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tight uppercase italic text-gray-900 mb-4">
          Returns Policy
        </h1>
        <p className="text-gray-600">
          Simple return guidelines so customers can shop with confidence.
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Return Window</h2>
          <p className="text-gray-600 leading-relaxed">
            Unused products can be returned within 30 days of delivery in original packaging.
          </p>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Eligible Condition</h2>
          <p className="text-gray-600 leading-relaxed">
            Items must be clean, unused, and in resellable condition. Returns that show signs of use may be declined.
          </p>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">How To Start a Return</h2>
          <p className="text-gray-600 leading-relaxed">
            Contact support with your order number and reason for return. We will provide the next steps and return instructions.
          </p>
        </section>
      </div>
    </div>
  );
}
