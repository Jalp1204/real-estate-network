// Renders a list of label/value facts. Entries with no value are skipped so
// nullable property fields are never shown as "null".
function PropertyFacts({ facts }) {
  const visible = facts.filter(
    (fact) => fact.value !== null && fact.value !== undefined && fact.value !== ""
  );

  if (visible.length === 0) return null;

  return (
    <dl className="facts">
      {visible.map((fact) => (
        <div className="facts__item" key={fact.label}>
          <dt className="facts__label">{fact.label}</dt>
          <dd className="facts__value">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default PropertyFacts;
