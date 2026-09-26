import { humanize } from "../utils/format.js";

// Renders a list of values as chips (used for amenities and specialities).
// Renders nothing when the list is empty.
function PropertyChips({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <ul className="chips">
      {items.map((item) => (
        <li className="chips__item" key={item}>
          {humanize(item)}
        </li>
      ))}
    </ul>
  );
}

export default PropertyChips;
