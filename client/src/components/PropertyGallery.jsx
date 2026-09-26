import { humanize } from "../utils/format.js";

// Photo gallery for a property. Renders the primary photo first and handles
// the "no photos" case gracefully.
function PropertyGallery({ photos, title }) {
  if (!Array.isArray(photos) || photos.length === 0) {
    return <p className="state-message">No photos available.</p>;
  }

  const ordered = [...photos].sort(
    (a, b) => Number(Boolean(b?.isPrimary)) - Number(Boolean(a?.isPrimary))
  );

  return (
    <ul className="gallery">
      {ordered.map((photo, index) => {
        const alt = photo?.caption || humanize(photo?.category) || title || "Property photo";
        return (
          <li className="gallery__item" key={photo?.url ?? index}>
            <img className="gallery__image" src={photo?.url} alt={alt} loading="lazy" />
            {photo?.caption && <span className="gallery__caption">{photo.caption}</span>}
          </li>
        );
      })}
    </ul>
  );
}

export default PropertyGallery;
