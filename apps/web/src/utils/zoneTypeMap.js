export const zoneTypeMap = {
  normal: "Kho thông thường",
  cold: "Kho lạnh",
  hazard: "Khu vực nguy hiểm",
  quarantine: "Khu cách ly",
};

export function zoneTypeLabel(type) {
  if (!type) {
    return "-";
  }

  return zoneTypeMap[type] || type;
}
