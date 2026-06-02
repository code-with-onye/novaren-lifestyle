/**
 * Renders one or more JSON-LD structured-data objects into a script tag.
 * Server-safe; emits valid application/ld+json consumed by search/AI engines.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  const json = Array.isArray(data) ? data : [data];
  return (
    <>
      {json.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Structured data is trusted, build-time content — safe to inline.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
