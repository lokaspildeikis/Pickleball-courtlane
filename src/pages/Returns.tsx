export function Returns() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tight uppercase italic text-gray-900 mb-4">
          Returns Policy
        </h1>
        <p className="text-gray-600">
          Flexible return guidelines so you can shop with confidence.
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Return Window</h2>
          <p className="text-gray-600 leading-relaxed">
            Most orders can be returned within 30 days of delivery. If you are slightly outside that window, contact us and we will do our best to help.
          </p>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Eligible Condition</h2>
          <p className="text-gray-600 leading-relaxed">
            We accept returns for items in good condition. Opened items may still be eligible depending on condition, and we review every request fairly on a case-by-case basis.
          </p>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">How To Start a Return</h2>
          <p className="text-gray-600 leading-relaxed">
            Contact support with your order number and a short reason for return, and we will share the next steps. If an item arrives damaged, incorrect, or defective, include a photo so we can resolve it quickly.
          </p>
        </section>
      </div>
    </div>
  );
}
