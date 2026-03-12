import { getFAQPageJsonLd } from "../../lib/json-ld";

export default function JsonLdFAQScript() {
  const faqJsonLd = getFAQPageJsonLd();
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
    />
  );
}
