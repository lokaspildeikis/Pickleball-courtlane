import { PageMeta } from "../components/seo/PageMeta";

export function Shipping() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <PageMeta
        title="Shipping Policy | Courtlane"
        description="Read Courtlane shipping policy, processing timelines, delivery estimates, and order tracking details."
        canonicalPath="/shipping"
      />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tight uppercase italic text-gray-900 mb-4">
          Shipping Policy
        </h1>
        <p className="text-gray-600">
          Thank you for shopping with us. We are committed to making sure your order arrives as smoothly as possible.
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Free express shipping</h2>
          <p className="text-gray-600 leading-relaxed">
            We offer free express shipping on all orders.
          </p>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Order Processing</h2>
          <p className="text-gray-600 leading-relaxed">
            Orders are usually processed within 1-3 business days after your order is placed. Orders are not typically processed or shipped on weekends or public holidays. During periods of high demand, launches, or promotional events, processing times may be slightly longer.
          </p>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Delivery Time</h2>
          <p className="text-gray-600 leading-relaxed">
            After your order has been processed and shipped, delivery takes around 10-14 business days in most cases. Please note that this is an estimate, not a guarantee. Shipping times can vary depending on your country, local carrier operations, customs clearance, weather conditions, and seasonal demand.
          </p>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Tracking Information</h2>
          <p className="text-gray-600 leading-relaxed">
            If tracking is available for your shipment, you will receive a shipping confirmation email with your tracking details once your order has been dispatched. Please allow a short period of time for tracking updates to appear after the package has been handed to the shipping carrier. In some cases, tracking may take a little longer to update even though the order is already in transit.
          </p>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Delivery Delays</h2>
          <p className="text-gray-600 leading-relaxed">
            While we do our best to deliver within the estimated timeframe, delays can occasionally happen for reasons outside our control. These may include customs processing, courier issues, weather disruptions, public holidays, supply chain interruptions, or increased shipping volumes. We appreciate your patience and understanding if your order experiences a delay.
          </p>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Shipping Address Accuracy</h2>
          <p className="text-gray-600 leading-relaxed">
            Please make sure your shipping address is complete and correct at checkout. We are not responsible for delivery problems, failed deliveries, or delays caused by incorrect or incomplete shipping details entered by the customer.
          </p>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Split Shipments</h2>
          <p className="text-gray-600 leading-relaxed">
            In some cases, your order may arrive in separate packages. This can happen depending on product availability, packaging requirements, or the fulfillment location of different items in your order. If your order is split into multiple shipments, you may receive separate tracking updates.
          </p>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Customs, Duties, and Taxes</h2>
          <p className="text-gray-600 leading-relaxed">
            For international orders, customs procedures may sometimes cause delivery delays. Depending on your country, customs duties, import taxes, or local handling fees may apply and are the responsibility of the customer where required by local regulations.
          </p>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Lost or Delayed Packages</h2>
          <p className="text-gray-600 leading-relaxed">
            If your package appears significantly delayed, please contact us and we will do our best to help. If tracking shows a shipment as delivered but you have not received it, we recommend first checking with household members, neighbors, or your local carrier before contacting us.
          </p>
        </section>

        <section className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Contact Us</h2>
          <p className="text-gray-600 leading-relaxed">
            If you have any questions about shipping, delivery times, or your order status, please contact us and we will be happy to assist you.
          </p>
        </section>
      </div>
    </div>
  );
}
