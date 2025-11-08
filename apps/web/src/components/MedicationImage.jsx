"use client";
import placeholderImg from "@/assets/medicine-placeholder.jpg";
import { instance } from "@/lib/axios";
import { useEffect, useState } from "react";

export default function MedicationImage({
  fileId,
  alt = "",
  size = 56,
  onClick,
}) {
  const [src, setSrc] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fileId) {
      console.log("🔍 No fileId provided, showing placeholder");
      setSrc(null);
      setError(false);
      return;
    }

    const loadImage = async () => {
      try {
        console.log(`🔍 Loading image for fileId: ${fileId}`);
        const token = localStorage.getItem("token");
        const res = await instance.get(`/files/${fileId}/view`, {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        });

        const reader = new FileReader();
        reader.onloadend = () => {
          console.log(
            `✅ Image loaded successfully for fileId: ${fileId}`,
            reader.result?.substring(0, 50) + "..."
          );
          setSrc(reader.result);
          setError(false);
        };
        reader.readAsDataURL(res.data);
      } catch (err) {
        console.warn(
          `❌ Load image failed for fileId: ${fileId}`,
          err.response?.status,
          err.response?.data
        );
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
        cursor: onClick ? "zoom-in" : "default",
      }}
      onClick={() => onClick && src && onClick(src, alt)}
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
          onError={(e) => {
            console.log(`❌ Image render error for fileId: ${fileId}`, e);
            setError(true);
          }}
          onLoad={() => console.log(`🖼️ Image rendered for fileId: ${fileId}`)}
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
