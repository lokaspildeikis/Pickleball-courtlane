import { PageMeta } from "../components/seo/PageMeta";

export function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <PageMeta
        title="Privacy Policy | Courtlane"
        description="Learn how Courtlane collects and uses personal information for orders, delivery updates, and customer support."
        canonicalPath="/privacy"
      />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tight uppercase italic text-gray-900 mb-4">
          Privacy Policy
        </h1>
        <p className="text-gray-600">
          We only use customer information to process orders, provide support, and improve your shopping experience.
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Information We Collect</h2>
          <p className="text-gray-600 leading-relaxed">
            We collect details needed to fulfill your order, such as name, shipping address, and contact information.
          </p>
        </section>
        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">How We Use It</h2>
          <p className="text-gray-600 leading-relaxed">
            Your information is used for order processing, delivery communication, and customer support.
          </p>
        </section>
        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Questions</h2>
          <p className="text-gray-600 leading-relaxed">
            If you have privacy questions, contact support and we will help.
          </p>
        </section>
      </div>
    </div>
  );
}

