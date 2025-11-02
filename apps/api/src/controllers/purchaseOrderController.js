import { purchaseOrderService } from "../services/purchaseOrderService.js";

export const purchaseOrderController = {
  // Create a new purchase order
  async create(req, res) {
    try {
      console.log(
        "📦 Received request body:",
        JSON.stringify(req.body, null, 2)
      );
      const po = await purchaseOrderService.create(req.body, req.user.id);
      res.status(201).json(po);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  },

  // Get all purchase orders
  async getAll(req, res) {
    try {
      const filters = {
        supplierId: req.query.supplierId || undefined, // UUID is a string
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: Number.parseInt(req.query.limit) || 100,
        offset: Number.parseInt(req.query.offset) || 0,
      };
      const pos = await purchaseOrderService.getAll(filters);
      res.json(pos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get purchase order by ID
  async getById(req, res) {
    try {
      const po = await purchaseOrderService.getById(req.params.id); // UUID is a string
      if (!po) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json(po);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Update purchase order
  async update(req, res) {
    try {
      const po = await purchaseOrderService.update(
        req.params.id, // UUID is a string
        req.body
      );
      if (!po) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json(po);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete purchase order
  async delete(req, res) {
    try {
      const po = await purchaseOrderService.delete(req.params.id); // UUID is a string
      if (!po) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json({
        message: "Purchase order deleted successfully",
        purchaseOrder: po,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Confirm purchase order (public endpoint for supplier)
  async confirm(req, res) {
    try {
      const { id } = req.params;
      const { token } = req.query;

      if (!token) {
        return res
          .status(400)
          .json({ error: "Confirmation token is required" });
      }

      const result = await purchaseOrderService.confirmOrder(id, token);

      // Return HTML response for user-friendly confirmation page
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              background: white;
              border-radius: 16px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              padding: 48px;
              max-width: 500px;
              text-align: center;
            }
            .icon {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 24px;
              font-size: 48px;
              color: white;
            }
            h1 {
              color: #1f2937;
              margin: 0 0 16px 0;
              font-size: 28px;
            }
            p {
              color: #6b7280;
              line-height: 1.6;
              margin: 0 0 24px 0;
            }
            .order-number {
              background: #f3f4f6;
              padding: 16px;
              border-radius: 8px;
              margin: 24px 0;
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
            }
            .footer {
              margin-top: 32px;
              padding-top: 24px;
              border-top: 1px solid #e5e7eb;
              color: #9ca3af;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✓</div>
            <h1>Purchase Order Confirmed!</h1>
            <p>Thank you for confirming receipt of the purchase order. The buyer has been notified and your order status has been updated.</p>
            <div class="order-number">Order #${result.orderNumber}</div>
            <p style="color: #059669; font-weight: 600;">Status: Ordered</p>
            <div class="footer">
              PharmaFlow - Pharmacy Management System<br/>
              You can now close this window
            </div>
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmation Failed</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              background: white;
              border-radius: 16px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              padding: 48px;
              max-width: 500px;
              text-align: center;
            }
            .icon {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 24px;
              font-size: 48px;
              color: white;
            }
            h1 {
              color: #1f2937;
              margin: 0 0 16px 0;
              font-size: 28px;
            }
            p {
              color: #6b7280;
              line-height: 1.6;
              margin: 0 0 24px 0;
            }
            .error {
              background: #fee2e2;
              border-left: 4px solid #dc2626;
              padding: 16px;
              border-radius: 4px;
              margin: 24px 0;
              text-align: left;
              color: #991b1b;
            }
            .footer {
              margin-top: 32px;
              padding-top: 24px;
              border-top: 1px solid #e5e7eb;
              color: #9ca3af;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✗</div>
            <h1>Confirmation Failed</h1>
            <p>We couldn't confirm your purchase order. This may be because:</p>
            <div class="error">
              <strong>Error:</strong> ${error.message}
            </div>
            <p style="font-size: 14px;">
              • The confirmation link has expired (valid for 7 days)<br/>
              • The link has already been used<br/>
              • The order has been cancelled or deleted
            </p>
            <p style="font-size: 14px; color: #9ca3af;">
              Please contact the buyer if you need a new confirmation link.
            </p>
            <div class="footer">
              PharmaFlow - Pharmacy Management System
            </div>
          </div>
        </body>
        </html>
      `);
    }
  },
};
