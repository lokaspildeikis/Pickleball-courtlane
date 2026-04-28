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
      answer: "If you are not satisfied with your purchase, you are covered by our 30-day money-back guarantee on unused items in original packaging. Contact our support team and we will help you start the return."
    },
    {
      question: "Will a paddle cover fit an elongated paddle?",
      answer: "Most sleeves and covers on Courtlane are listed with size or fit notes on the product page. If you are between shapes, check the dimensions in the description or email us with your paddle length—we will point you to the best match."
    },
    {
      question: "How often should I change my overgrip?",
      answer: "This depends on how often you play and how much you sweat. For casual players (1-2 times a week), we recommend changing it every month. For competitive players, you may want to change it every 1-2 weeks to maintain optimal tackiness."
    },
    {
      question: "What is the best pickleball starter kit for beginners?",
      answer: "The best starter kit is one that includes core essentials together, such as paddles, balls, and basic accessories. Most new players choose a simple beginner pickleball set or bundle so they can start playing right away without buying each item separately.",
    },
    {
      question: "Is pickleball a low-impact sport for older adults?",
      answer: "Yes. Pickleball is widely considered a low-impact sport because it is played on a smaller court with less running than many other racket sports. Many adults choose it as a safer way to stay active while being easier on knees and hips.",
    },
    {
      question: "What comes in a pickleball bundle?",
      answer: "It depends on the specific product, but most pickleball bundles include a starter combination of paddles, balls, and useful accessories. Check each product page for exact bundle contents and options before checkout.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <PageMeta
        title="Help & FAQ | Courtlane"
        description="Answers about Courtlane, pickleball gear, returns, shipping, and how to get support."
        canonicalPath="/faq"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }}
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
        <p className="text-sm text-gray-600 mb-4">
          Want to start quickly? <a href="/shop?filter=bundles" className="text-teal-700 font-semibold hover:underline">Shop starter kits &amp; bundles</a>.
        </p>
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
