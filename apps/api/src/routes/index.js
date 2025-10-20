import { Router } from "express";

import { authRouter } from "./authRoutes.js";
import { customerRouter } from "./customerRoutes.js";
import emailRouter from "./emailRoutes.js";
import { inventoryRouter } from "./inventoryRoutes.js";
import { medicationRouter } from "./medicationRoutes.js";
import { purchaseOrderItemRouter } from "./purchaseOrderItemRoutes.js";
import { purchaseOrderReceiptItemRouter } from "./purchaseOrderReceiptItemRoutes.js";
import { purchaseOrderRouter } from "./purchaseOrderRoutes.js";
import { registrationRouter } from "./registrationRoutes.js";
import { reportRouter } from "./reportRoutes.js";
import { salesOrderRouter } from "./salesOrderRoutes.js";
import { supplierRouter } from "./supplierRoutes.js";
import { userRouter } from "./userRoutes.js";
import { warehouseRouter } from "./warehouse/index.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/registrations", registrationRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/customers", customerRouter);
apiRouter.use("/medications", medicationRouter); // Includes nested /variants routes
apiRouter.use("/suppliers", supplierRouter); // Includes nested /medications routes
apiRouter.use("/purchases", purchaseOrderRouter); // Includes nested /receipts routes
apiRouter.use("/purchase-order-items", purchaseOrderItemRouter);
apiRouter.use("/purchase-order-receipt-items", purchaseOrderReceiptItemRouter);
apiRouter.use("/warehouse", warehouseRouter);
apiRouter.use("/inventory", inventoryRouter);
apiRouter.use("/sales", salesOrderRouter);
apiRouter.use("/reports", reportRouter);
apiRouter.use(emailRouter); // Email routes

export default apiRouter;
