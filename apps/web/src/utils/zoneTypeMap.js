export const zoneTypeMap = {
  normal: "Khu thông thường",
  cold: "Khu lạnh",
  hazard: "Khu vực nguy hiểm",
  quarantine: "Khu cách ly",
};

export function zoneTypeLabel(type) {
  if (!type) {
    return "-";
  }

  return zoneTypeMap[type] || type;
}
