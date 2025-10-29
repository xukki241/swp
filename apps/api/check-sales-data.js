// Quick script to check if there's any sales data in the database
import { count, sql } from "drizzle-orm";
import { db } from "./src/db/index.js";
import { salesOrders } from "./src/db/schema/salesOrders.js";

async function checkSalesData() {
  try {
    console.log("🔍 Checking sales data in database...\n");

    // Get current month date range
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(
      currentYear,
      currentMonth + 1,
      0,
      23,
      59,
      59,
      999
    );

    console.log(
      `📅 Checking for month: ${startOfMonth.toLocaleDateString()} - ${endOfMonth.toLocaleDateString()}\n`
    );

    // Check total sales orders
    const [totalSales] = await db.select({ count: count() }).from(salesOrders);

    console.log(`📊 Total sales orders in database: ${totalSales.count}`);

    // Check sales for current month
    const [currentMonthSales] = await db
      .select({
        count: count(),
        totalRevenue: sql`COALESCE(SUM(${salesOrders.totalAmount}), 0)`,
      })
      .from(salesOrders)
      .where(
        sql`${salesOrders.orderDate} >= ${startOfMonth} AND ${salesOrders.orderDate} <= ${endOfMonth}`
      );

    console.log(
      `📅 Sales orders this month (${currentMonth + 1}/${currentYear}): ${currentMonthSales.count}`
    );
    console.log(
      `💰 Total revenue this month: ${Number(currentMonthSales.totalRevenue).toLocaleString("vi-VN")} ₫`
    );

    // If no data this month, check last 3 months
    if (currentMonthSales.count === 0) {
      console.log("\n⚠️  No sales data for current month!");
      console.log("\n🔍 Checking last 3 months...\n");

      for (let i = 1; i <= 3; i++) {
        const checkMonth = currentMonth - i;
        const checkYear = checkMonth < 0 ? currentYear - 1 : currentYear;
        const normalizedMonth = checkMonth < 0 ? 12 + checkMonth : checkMonth;

        const monthStart = new Date(checkYear, normalizedMonth, 1);
        const monthEnd = new Date(
          checkYear,
          normalizedMonth + 1,
          0,
          23,
          59,
          59,
          999
        );

        const [monthData] = await db
          .select({
            count: count(),
            totalRevenue: sql`COALESCE(SUM(${salesOrders.totalAmount}), 0)`,
          })
          .from(salesOrders)
          .where(
            sql`${salesOrders.orderDate} >= ${monthStart} AND ${salesOrders.orderDate} <= ${monthEnd}`
          );

        console.log(
          `${monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })}: ${monthData.count} orders, ${Number(monthData.totalRevenue).toLocaleString("vi-VN")} ₫`
        );
      }
    }

    // Get sample of recent orders
    console.log("\n📋 Recent sales orders (last 5):\n");
    const recentOrders = await db
      .select({
        id: salesOrders.id,
        orderDate: salesOrders.orderDate,
        totalAmount: salesOrders.totalAmount,
        status: salesOrders.status,
      })
      .from(salesOrders)
      .orderBy(sql`${salesOrders.orderDate} DESC`)
      .limit(5);

    if (recentOrders.length === 0) {
      console.log("❌ No sales orders found in database!");
      console.log(
        "\n💡 Solution: Create sales orders through the Sales page (/sales)"
      );
      console.log("   Or insert test data using SQL");
    } else {
      recentOrders.forEach((order, i) => {
        console.log(
          `${i + 1}. Order #${order.id} - ${new Date(order.orderDate).toLocaleDateString()} - ${Number(order.totalAmount).toLocaleString("vi-VN")} ₫ - ${order.status}`
        );
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ Check complete!");

    if (currentMonthSales.count === 0) {
      console.log("\n🎯 Kết luận:");
      console.log("   - Database KHÔNG CÓ dữ liệu sales cho tháng hiện tại");
      console.log("   - Đây là lý do Dashboard hiển thị 0");
      console.log("   - Đây là BEHAVIOR ĐÚNG (không phải bug!)");
      console.log("\n📝 Để có dữ liệu:");
      console.log("   1. Tạo sales orders qua trang Sales (/sales)");
      console.log("   2. Hoặc import test data vào database");
    } else {
      console.log("\n✅ Database có dữ liệu! Nếu Dashboard vẫn hiển thị 0:");
      console.log("   1. Check browser console (F12) for errors");
      console.log("   2. Check Network tab - API call có thành công không?");
      console.log("   3. Run: .\\test-dashboard-api.ps1");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking database:", error.message);
    console.error(error);
    process.exit(1);
  }
}

checkSalesData();
