import { Link } from 'react-router-dom';
import { SUPPORT_EMAIL } from '../lib/trustContent';
import { PageMeta } from '../components/seo/PageMeta';

type FaqItem = {
  question: string;
  answer: React.ReactNode;
};

const faqs: FaqItem[] = [
  {
    question: "I'm completely new to pickleball — which set should I get?",
    answer:
      "Start with the Starter Kit. It comes with two beginner-friendly paddles, balls that work indoor and out, and a bag to carry everything. No research required, no upgrades needed for at least your first season.",
  },
  {
    question: "Are your paddles USAPA approved?",
    answer:
      "Yes. All Courtlane paddles are USAPA approved, which means they're legal for league play, tournaments, and any organized pickleball you'd ever want to join.",
  },
  {
    question: "Can I use these indoor and outdoor?",
    answer:
      "Yes. The balls included with our sets are designed for outdoor play but work fine indoors too. The paddles are good on any court surface.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Orders are processed within 1–3 business days. Domestic US shipping usually takes another 3–5 business days. International orders typically arrive within 7–14 business days depending on your country. Free shipping on every order.",
  },
  {
    question: "Where do you ship?",
    answer:
      "We ship worldwide. Delivery times depend on your country, and any local customs or import fees are the buyer's responsibility.",
  },
  {
    question: "What if it's not for me?",
    answer: (
      <>
        30-day money-back guarantee on unused items in original packaging. If something isn't right,
        email{' '}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-teal-700 font-medium hover:underline underline-offset-2"
        >
          {SUPPORT_EMAIL}
        </a>{' '}
        and we'll sort it out.
      </>
    ),
  },
  {
    question: "What if my paddle breaks?",
    answer: (
      <>
        If anything fails outside normal wear and tear, email us with a photo at{' '}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-teal-700 font-medium hover:underline underline-offset-2"
        >
          {SUPPORT_EMAIL}
        </a>{' '}
        and we'll make it right.
      </>
    ),
  },
  {
    question: "Who actually runs Courtlane?",
    answer: (
      <>
        I do. My name's Rokas — founder, customer service, and the person who picks every product.{' '}
        <Link to="/our-story" className="text-teal-700 font-medium hover:underline underline-offset-2">
          See Our Story
        </Link>{' '}
        for the longer version.
      </>
    ),
  },
  {
    question: "How do I contact you?",
    answer: (
      <>
        Email{' '}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-teal-700 font-medium hover:underline underline-offset-2"
        >
          {SUPPORT_EMAIL}
        </a>
        . It comes to me directly, and I try to answer within a day.
      </>
    ),
  },
];

const plainTextAnswers = [
  "Start with the Starter Kit. It comes with two beginner-friendly paddles, balls that work indoor and out, and a bag to carry everything. No research required, no upgrades needed for at least your first season.",
  "Yes. All Courtlane paddles are USAPA approved, which means they're legal for league play, tournaments, and any organized pickleball you'd ever want to join.",
  "Yes. The balls included with our sets are designed for outdoor play but work fine indoors too. The paddles are good on any court surface.",
  "Orders are processed within 1–3 business days. Domestic US shipping usually takes another 3–5 business days. International orders typically arrive within 7–14 business days depending on your country. Free shipping on every order.",
  "We ship worldwide. Delivery times depend on your country, and any local customs or import fees are the buyer's responsibility.",
  `30-day money-back guarantee on unused items in original packaging. If something isn't right, email ${SUPPORT_EMAIL} and we'll sort it out.`,
  `If anything fails outside normal wear and tear, email us with a photo at ${SUPPORT_EMAIL} and we'll make it right.`,
  "I do. My name's Rokas — founder, customer service, and the person who picks every product. See Our Story at courtlane.us/our-story for the longer version.",
  `Email ${SUPPORT_EMAIL}. It comes to me directly, and I try to answer within a day.`,
];

export function FAQ() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <PageMeta
        title="FAQ | Courtlane"
        description="Answers about Courtlane gear, USAPA approval, shipping, returns, and who runs the store."
        canonicalPath="/faq"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq, i) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: plainTextAnswers[i],
            },
          })),
        }}
      />

      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tight uppercase italic text-gray-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 text-base leading-relaxed">
          Orders, gear, shipping, returns — and who's actually behind the store.
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

      <div className="mt-16 bg-gray-50 border border-gray-200 p-8 rounded-sm text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h2>
        <p className="text-gray-600 text-sm mb-6">Email goes directly to me — I'll reply within a day.</p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="inline-flex items-center justify-center h-11 px-6 font-medium bg-teal-800 text-white hover:bg-teal-900 rounded-sm transition-colors text-sm"
        >
          Email {SUPPORT_EMAIL}
        </a>
      </div>
    </div>
  );
}
