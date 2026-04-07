export function Shipping() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tight uppercase italic text-gray-900 mb-4">
          Shipping Policy
        </h1>
        <p className="text-gray-600">
          Clear shipping timelines and delivery information for every order.
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Processing Time</h2>
          <p className="text-gray-600 leading-relaxed">
            Orders are processed within 1-2 business days. You will receive a confirmation email with tracking details once your order ships.
          </p>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Delivery Estimates</h2>
          <p className="text-gray-600 leading-relaxed">
            Standard US shipping usually arrives in 3-5 business days after dispatch. Delivery times can vary during holidays and peak periods.
          </p>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Shipping Coverage</h2>
          <p className="text-gray-600 leading-relaxed">
            We currently ship within the United States. International shipping is not available yet, but it is planned for future releases.
          </p>
        </section>
      </div>
    </div>
  );
}
