import { PageMeta } from "../components/seo/PageMeta";

export function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <PageMeta
        title="Terms of Service | Courtlane"
        description="Review Courtlane terms of service, including ordering terms, shipping and returns policies, and support guidance."
        canonicalPath="/terms"
      />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tight uppercase italic text-gray-900 mb-4">
          Terms of Service
        </h1>
        <p className="text-gray-600">
          These terms explain the basic conditions for shopping on Courtlane.
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Orders</h2>
          <p className="text-gray-600 leading-relaxed">
            By placing an order, you confirm that your shipping and contact details are accurate.
          </p>
        </section>
        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Shipping and Returns</h2>
          <p className="text-gray-600 leading-relaxed">
            Shipping and returns are handled according to our published shipping and returns policies.
          </p>
        </section>
        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Support</h2>
          <p className="text-gray-600 leading-relaxed">
            If an issue comes up with your order, contact support and we will work with you on the next steps.
          </p>
        </section>
      </div>
    </div>
  );
}

