import { useState } from "react";
import { imageUrl } from "../../services/movieService";
import "./MoviePoster.css";

const TINTS = [
  "#dfe9dd",
  "#e6e0f0",
  "#d9efe6",
  "#f8e3d3",
  "#f6efc9",
  "#cfdcd2",
];

export default function MoviePoster({ movie, size = "w500", className = "" }) {
  const [failed, setFailed] = useState(false);
  const src = imageUrl(movie.poster_path, size);
  const year = movie.release_date?.slice(0, 4);

  if (src && !failed) {
    return (
      <img
        className={`poster ${className}`}
        src={src}
        alt={`${movie.title} poster`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`poster poster--fallback ${className}`}
      style={{ background: TINTS[movie.id % TINTS.length] }}
      role="img"
      aria-label={`${movie.title} (poster unavailable)`}
    >
      <span className="poster__title">{movie.title}</span>
      {year && <span className="poster__year">{year}</span>}
    </div>
  );
}
