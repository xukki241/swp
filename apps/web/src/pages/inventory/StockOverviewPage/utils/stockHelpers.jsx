import { Badge } from "@/components/ui/badge";

export function calculateRemainingDays(expiryDateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = new Date(expiryDateString);
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getExpiryBadge(daysRemaining) {
  if (daysRemaining < 90) {
    return (
      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
        Gần hết hạn
      </Badge>
    );
  }
  return (
    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
      Tốt
    </Badge>
  );
}

export function getLowStockBadge(quantity, threshold = 50) {
  if (quantity < threshold) {
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
        Sắp hết hàng
      </Badge>
    );
  }
  return null;
}

export function getExpiryWarningBadge(daysRemaining) {
  if (daysRemaining < 90) {
    return (
      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
        Gần hết hạn
      </Badge>
    );
  }
  return null;
}
