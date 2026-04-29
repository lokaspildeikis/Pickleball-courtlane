import { PageMeta } from "../components/seo/PageMeta";

export function Returns() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <PageMeta
        title="Returns Policy | Courtlane"
        description="Read Courtlane returns policy, return window, item condition guidelines, and how to start a return request."
        canonicalPath="/returns"
      />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tight uppercase italic text-gray-900 mb-4">
          Returns Policy
        </h1>
        <p className="text-gray-600">
          We want you to be happy with your purchase. If something is not right, eligible items can be returned under the terms below.
        </p>
        <p className="text-sm text-gray-500 mt-3">Last updated: April 29, 2026</p>
      </div>

      <div className="space-y-8">
        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">1. Return window</h2>
          <p className="text-gray-600 leading-relaxed">
            You may return most items within 30 days of the delivery date.
          </p>
          <p className="text-gray-600 leading-relaxed">
            To be eligible, the return request must be submitted within this 30-day window through our returns portal or by contacting our support team.
          </p>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">2. Item condition</h2>
          <p className="text-gray-600 leading-relaxed">
            To qualify for a refund or store credit:
          </p>
          <ul className="mt-3 space-y-2 text-gray-600 leading-relaxed list-disc pl-5">
            <li>Items must be unused, unwashed, and in the same condition that you received them.</li>
            <li>Items must include all original tags, accessories, manuals, and packaging where applicable.</li>
            <li>We reserve the right to refuse returns that are not in resaleable condition or that show signs of misuse.</li>
          </ul>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">3. Non-returnable items</h2>
          <p className="text-gray-600 leading-relaxed">
            Unless they arrive damaged or defective, the following are not eligible for return:
          </p>
          <ul className="mt-3 space-y-2 text-gray-600 leading-relaxed list-disc pl-5">
            <li>Final sale / clearance items (clearly marked as &quot;Final Sale&quot; at checkout).</li>
            <li>Gift cards and downloadable/digital products.</li>
            <li>Customized, personalized, or made-to-order items.</li>
            <li>Perishable or hygiene-sensitive products, where indicated on the product page.</li>
          </ul>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">4. Return options (refunds, exchanges, credit)</h2>
          <p className="text-gray-600 leading-relaxed">
            When your return is approved, you may be offered one or more of these options (depending on the product and stock availability):
          </p>
          <ul className="mt-3 space-y-2 text-gray-600 leading-relaxed list-disc pl-5">
            <li>Refund to original payment method.</li>
            <li>Exchange for a different size, color, or variant of the same product.</li>
            <li>Store credit to use on a future order.</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            Some promotional items may only be eligible for exchange or store credit; this will be stated on the product page or at checkout.
          </p>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">5. Return shipping</h2>
          <p className="text-gray-600 leading-relaxed">
            For returns due to our error (wrong item, damaged in transit, defective on arrival), we cover return shipping costs or provide a prepaid label.
          </p>
          <p className="text-gray-600 leading-relaxed mt-3">
            For all other returns (for example, change of mind or wrong size ordered), you may be responsible for return shipping; this will be clearly shown in the returns portal or in your return confirmation email.
          </p>
          <p className="text-gray-600 leading-relaxed mt-3">
            Original shipping costs (if any) are generally non-refundable unless the return is due to our error.
          </p>
          <p className="text-gray-600 leading-relaxed mt-3">
            You are responsible for ensuring the package is securely packed and properly labeled. We recommend using a trackable shipping method.
          </p>
        </section>
      </div>
    </div>
  );
}
