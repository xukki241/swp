"use client";
import placeholderImg from "@/assets/medicine-placeholder.jpg";
import { instance } from "@/lib/axios";
import { useEffect, useState } from "react";

export default function MedicationImage({ fileId, alt = "", size = 56 }) {
  const [src, setSrc] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fileId) {
      setSrc(null);
      setError(false);
      return;
    }

    const loadImage = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await instance.get(`/files/${fileId}/view`, {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        });

        const reader = new FileReader();
        reader.onloadend = () => {
          setSrc(reader.result);
          setError(false);
        };
        reader.readAsDataURL(res.data);
      } catch (err) {
        console.warn("❌ Load image failed", err);
        setSrc(null);
        setError(true);
      }
    };

    loadImage();
  }, [fileId]);

  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#f3f4f6",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: size,
            height: size,
            objectFit: "cover",
          }}
          onError={() => setError(true)}
        />
      ) : (
        <img
          src={placeholderImg}
          alt={alt || "Medication placeholder"}
          style={{
            width: size,
            height: size,
            objectFit: "cover",
            opacity: 0.6,
          }}
        />
      )}
    </div>
  );
}
