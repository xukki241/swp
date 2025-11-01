"use client";
import { useEffect, useState } from "react";
import { instance } from "@/lib/axios";

export default function MedicationImage({ fileId, alt = "", size = 56 }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!fileId) return setSrc(null);

    const loadImage = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await instance.get(`/files/${fileId}/view`, {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        });

        // 🔥 Convert blob → base64 để không bị CSP hay cross-origin chặn
        const reader = new FileReader();
        reader.onloadend = () => setSrc(reader.result);
        reader.readAsDataURL(res.data);
      } catch (err) {
        console.warn("❌ Load image failed", err);
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
