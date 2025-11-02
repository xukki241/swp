import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function truncateWords(text, limit) {
  // Trả về chuỗi rỗng nếu đầu vào không hợp lệ
  if (!text || typeof text !== "string" || limit <= 0) {
    return "";
  }

  // Tách chuỗi thành mảng các từ, lọc bỏ các khoảng trắng rỗng
  // (sử dụng regex \s+ để xử lý nhiều khoảng trắng, tab, xuống dòng)
  const words = text.trim().split(/\s+/);

  // Nếu số lượng từ không vượt quá giới hạn, trả về chuỗi gốc
  if (words.length <= limit) {
    return text;
  }

  // Lấy các từ trong giới hạn, nối lại và thêm dấu "..."
  return words.slice(0, limit).join(" ") + "...";
}
