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
    { id: "returns-30", label: "30-Day Returns" },
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
    { id: "returns-30", label: "30-day return window on unused items" },
  ] satisfies TrustPoint[],
};

export const POLICY_SNIPPETS = {
  productDetail: [
    {
      id: "shipping",
      title: "Shipping",
      text: "Orders are usually processed in 1-3 business days. Delivery is typically 10-14 business days after dispatch.",
      href: "/shipping",
    },
    {
      id: "returns",
      title: "Returns",
      text: "Unused items can be returned within 30 days of delivery in original packaging.",
      href: "/returns",
    },
    {
      id: "payments",
      title: "Payments",
      text: "Checkout is encrypted and processed securely.",
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
      text: "30-day returns on eligible unused items.",
      href: "/returns",
    },
  ] satisfies TrustPolicySnippet[],
};

