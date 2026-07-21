"use client";
import { useState } from "react";

// Renders a student photo with a fallback when the URL is missing or fails to load.
export default function StudentAvatar({ src, alt = "", imgClassName, fallback }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return fallback;
  return (
    <img
      src={src}
      alt={alt}
      className={imgClassName}
      onError={() => setFailed(true)}
    />
  );
}
