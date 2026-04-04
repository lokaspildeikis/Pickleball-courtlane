export function FAQ() {
  const faqs = [
    {
      question: "How long does shipping take?",
      answer: "We process all orders within 1-2 business days. Standard shipping within the US typically takes 3-5 business days. Expedited options are available at checkout."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Currently, we only ship within the United States. We are working hard to expand our shipping options to Canada and Europe soon."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy on all unused items in their original packaging. If you're not satisfied with your purchase, please contact our support team to initiate a return."
    },
    {
      question: "Will your paddle covers fit my elongated paddle?",
      answer: "Yes! Our Aero Neoprene Paddle Covers are designed with a universal fit that accommodates both standard and elongated paddle shapes up to 16.5 inches in length."
    },
    {
      question: "How often should I change my overgrip?",
      answer: "This depends on how often you play and how much you sweat. For casual players (1-2 times a week), we recommend changing it every month. For competitive players, you may want to change it every 1-2 weeks to maintain optimal tackiness."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black tracking-tight uppercase italic text-gray-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600">
          Everything you need to know about our products, shipping, and returns.
        </p>
      </div>

      <div className="space-y-8">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center bg-gray-50 p-8 rounded-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h2>
        <p className="text-gray-600 mb-6">Our support team is ready to help you out.</p>
        <a 
          href="mailto:support@courtlane.example.com" 
          className="inline-flex items-center justify-center h-11 px-6 font-medium bg-teal-800 text-white hover:bg-teal-900 rounded-sm transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
