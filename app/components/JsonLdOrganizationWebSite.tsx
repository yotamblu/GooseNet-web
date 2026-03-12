import { ORGANIZATION_JSON_LD, WEBSITE_JSON_LD } from "../../lib/json-ld";

export default function JsonLdOrganizationWebSite() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(ORGANIZATION_JSON_LD),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(WEBSITE_JSON_LD),
        }}
      />
    </>
  );
}
