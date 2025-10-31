"use client";
import { useEffect, useState } from "react";
import { instance } from "@/lib/axios";

export default function MedicationImage({ fileId, alt = "", size = 56 }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!fileId) return setSrc(null);

    const loadImage = async () => {
      try {
        // ✅ Tạo request có token bằng axios
        const token = localStorage.getItem("token");
        const res = await instance.get(`/files/${fileId}/view`, {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const blobUrl = URL.createObjectURL(res.data);
        setSrc(blobUrl);
      } catch (err) {
        console.warn("❌ Failed to load image", err);
        setSrc(null);
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
        border: "1px solid #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: size,
            height: size,
            objectFit: "cover",
            borderRadius: 8,
          }}
        />
      ) : (
        <span style={{ fontSize: 12, color: "#999" }}>No Image</span>
      )}
    </div>
  );
}
