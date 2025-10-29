# Dashboard Components

Reusable React components for the PharmaFlow Dashboard.

## Components

### StatCard

Displays a metric with icon, value, and trend.

**Props:**

- `stat` (object):
  - `title` (string): Metric name
  - `value` (string): Metric value
  - `icon` (LucideIcon): Icon component
  - `trend` (string): Percentage change
  - `trendUp` (boolean): Trend direction
  - `loading` (boolean): Loading state

**Example:**

```jsx
import { StatCard } from "@/components/dashboard";
import { ShoppingCart } from "lucide-react";

<StatCard 
  stat={{
    title: "Total Orders",
    value: "150",
    icon: ShoppingCart,
    trend: "+12.5%",
    trendUp: true,
    loading: false
  }} 
/>
```

---

### WelcomeBanner

Animated welcome header with greeting and date/time.

**Props:**

- `userName` (string): User's name
- `greeting` (string): Time-based greeting

**Example:**

```jsx
import { WelcomeBanner } from "@/components/dashboard";

<WelcomeBanner 
  userName="John Doe" 
  greeting="Good morning" 
/>
```

---

### QuickActionCard

Interactive button card for navigation.

**Props:**

- `action` (object):
  - `title` (string): Action name
  - `description` (string): Action description
  - `icon` (LucideIcon): Icon component
  - `color` (string): Background color class
  - `iconColor` (string): Icon color class
  - `path` (string): Navigation path
- `onClick` (function): Click handler

**Example:**

```jsx
import { QuickActionCard } from "@/components/dashboard";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router";

const navigate = useNavigate();

<QuickActionCard
  action={{
    title: "New Sale",
    description: "Create order",
    icon: ShoppingCart,
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    path: "/sales"
  }}
  onClick={() => navigate("/sales")}
/>
```

---

### ActivityItem

Display item for recent activity feed.

**Props:**

- `activity` (object):
  - `id` (string|number): Unique identifier
  - `type` (string): Activity type
  - `description` (string): Activity description
  - `time` (string): Relative time
  - `icon` (LucideIcon): Icon component
  - `color` (string): Icon color class

**Example:**

```jsx
import { ActivityItem } from "@/components/dashboard";
import { ShoppingCart } from "lucide-react";

<ActivityItem
  activity={{
    id: 1,
    type: "sale",
    description: "New sale order completed",
    time: "5 minutes ago",
    icon: ShoppingCart,
    color: "text-green-600"
  }}
/>
```

## Styling

All components use TailwindCSS and follow the design system:

- **Primary**: Blue gradient
- **Borders**: Rounded corners (rounded-xl, rounded-2xl)
- **Shadows**: Elevation system (shadow-lg, shadow-xl)
- **Animations**: Smooth transitions and hover effects

## Best Practices

1. **Always provide loading states** for async data
2. **Use semantic icons** that match the context
3. **Keep descriptions concise** (max 50 characters)
4. **Test hover states** across devices
5. **Ensure keyboard accessibility**

## Dependencies

- React 18.3+
- Lucide React (icons)
- TailwindCSS 4+
- Radix UI (Card components)
