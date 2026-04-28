export type TrustPoint = {
  id: string;
  label: string;
};

export type TrustPolicySnippet = {
  id: string;
  title: string;
  text: string;
  href?: string;
};

/**
 * Centralized trust and policy copy.
 * Update this file to keep trust messaging consistent across pages.
 */
export const SUPPORT_EMAIL = "hello@courtlane.us";

export const TRUST_POINTS = {
  productCta: [
    { id: "secure-checkout", label: "Secure Checkout" },
    { id: "returns-30", label: "30-Day Money-Back Guarantee" },
    { id: "processing", label: "1-3 Day Processing" },
    { id: "email-support", label: "Email Support" },
  ] satisfies TrustPoint[],
  cartCheckout: [
    { id: "secure-checkout", label: "Secure Checkout" },
    { id: "returns-30", label: "30-Day Returns" },
    { id: "shipping-estimate", label: "Delivery estimate shown in policy" },
  ] satisfies TrustPoint[],
  homeTop: [
    { id: "pickleball-focused", label: "Pickleball-focused essentials" },
    { id: "processing", label: "Orders processed in 1-3 business days" },
    { id: "returns-30", label: "Not satisfied? 30-day money-back guarantee" },
  ] satisfies TrustPoint[],
};

export const POLICY_SNIPPETS = {
  productDetail: [
    {
      id: "payments",
      title: "Payments",
      text: "Checkout is encrypted and processed securely.",
    },
    {
      id: "shipping",
      title: "Shipping",
      text: "Orders are usually processed in 1-3 business days. Delivery is typically 10-14 business days after dispatch.",
      href: "/shipping",
    },
    {
      id: "returns",
      title: "Returns",
      text: "If you are not satisfied, you are covered by our 30-day money-back guarantee on eligible unused items in original packaging.",
      href: "/returns",
    },
    {
      id: "support",
      title: "Support",
      text: `Need help before ordering? Contact ${SUPPORT_EMAIL}.`,
      href: `mailto:${SUPPORT_EMAIL}`,
    },
  ] satisfies TrustPolicySnippet[],
  cart: [
    {
      id: "shipping",
      title: "Shipping details",
      text: "Shipping timelines are explained in our shipping policy.",
      href: "/shipping",
    },
    {
      id: "returns",
      title: "Returns policy",
      text: "Not satisfied? 30-day money-back guarantee on eligible unused items.",
      href: "/returns",
    },
  ] satisfies TrustPolicySnippet[],
};

