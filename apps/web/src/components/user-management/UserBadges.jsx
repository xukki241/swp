import { CheckCircle, XCircle, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Status badge variants configuration
 */
const STATUS_VARIANTS = {
  active: {
    className: "bg-green-100 text-green-700 hover:bg-green-100",
    icon: CheckCircle,
  },
  inactive: {
    className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
    icon: XCircle,
  },
  suspended: {
    className: "bg-red-100 text-red-700 hover:bg-red-100",
    icon: Ban,
  },
};

/**
 * Role badge color configuration
 */
const ROLE_COLORS = {
  owner: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  staff: "bg-blue-100 text-blue-700 hover:bg-blue-100",
};

/**
 * Status badge component
 * @param {Object} props
 * @param {string} props.status - User status (active, inactive, suspended)
 */
export function StatusBadge({ status }) {
  const config = STATUS_VARIANTS[status] || STATUS_VARIANTS.inactive;
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

/**
 * Role badge component
 * @param {Object} props
 * @param {string} props.role - User role (owner, staff)
 */
export function RoleBadge({ role }) {
  const colorClass = ROLE_COLORS[role] || ROLE_COLORS.staff;

  return (
    <Badge variant="secondary" className={colorClass}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
}
