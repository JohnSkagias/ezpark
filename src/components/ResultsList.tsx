type Props = { features: GeoJSON.Feature[] };
export default function ResultsList({ features }: Props) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Προτάσεις</h2>
      <ul className="space-y-2">
        {features.map((f, i) => (
          <li key={i} className="rounded-lg p-3 border">
            <div className="font-medium">{(f.properties as any)?.name}</div>
            <div className="text-sm opacity-70">{(f.properties as any)?.municipality}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
