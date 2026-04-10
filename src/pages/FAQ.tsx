import { SUPPORT_EMAIL } from "../lib/trustContent";
import { PageMeta } from "../components/seo/PageMeta";

export function FAQ() {
  const faqs = [
    {
      question: "What is Courtlane?",
      answer:
        "Courtlane is an online store focused on pickleball accessories and essentials—think grips, balls, bags, covers, towels, and starter bundles. We cater to beginners and everyday recreational players who want practical gear and clear information, not marketplace guesswork.",
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy on all unused items in their original packaging. If you're not satisfied with your purchase, please contact our support team to initiate a return."
    },
    {
      question: "Will a paddle cover fit an elongated paddle?",
      answer: "Most sleeves and covers on Courtlane are listed with size or fit notes on the product page. If you are between shapes, check the dimensions in the description or email us with your paddle length—we will point you to the best match."
    },
    {
      question: "How often should I change my overgrip?",
      answer: "This depends on how often you play and how much you sweat. For casual players (1-2 times a week), we recommend changing it every month. For competitive players, you may want to change it every 1-2 weeks to maintain optimal tackiness."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <PageMeta
        title="Help & FAQ | Courtlane"
        description="Answers about Courtlane, pickleball gear, returns, shipping, and how to get support."
      />
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black tracking-tight uppercase italic text-gray-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600">
          Orders, gear questions, shipping, and returns—plus who Courtlane is for.
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
          href={`mailto:${SUPPORT_EMAIL}`} 
          className="inline-flex items-center justify-center h-11 px-6 font-medium bg-teal-800 text-white hover:bg-teal-900 rounded-sm transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
