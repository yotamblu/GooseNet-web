import JsonLdHowTo from "../components/JsonLdHowTo";
import JsonLdFAQScript from "../components/JsonLdFAQScript";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLdHowTo />
      <JsonLdFAQScript />
      {children}
    </>
  );
}
