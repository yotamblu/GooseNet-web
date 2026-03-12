import { getHowToJsonLd } from "../../lib/json-ld";

export default function JsonLdHowTo() {
  const howToJsonLd = getHowToJsonLd();
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
    />
  );
}
