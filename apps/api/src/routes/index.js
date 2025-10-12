import { Router } from "express";

import { authRouter } from "./authRoutes.js";
import { inventoryRouter } from "./inventoryRoutes.js";
import { medicationRouter } from "./medicationRoutes.js";
import { medicationVariantRouter } from "./medicationVariantRoutes.js";
import { purchaseOrderItemRouter } from "./purchaseOrderItemRoutes.js";
import { purchaseOrderReceiptItemRouter } from "./purchaseOrderReceiptItemRoutes.js";
import { purchaseOrderReceiptRouter } from "./purchaseOrderReceiptRoutes.js";
import { purchaseOrderRouter } from "./purchaseOrderRoutes.js";
import { registrationRouter } from "./registrationRoutes.js";
import { supplierMedicationVariantRouter } from "./supplierMedicationVariantRoutes.js";
import { supplierRouter } from "./supplierRoutes.js";
import { userRouter } from "./userRoutes.js";
import { warehouseRouter } from "./warehouse/index.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/registrations", registrationRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/medications", medicationRouter);
apiRouter.use("/medication-variants", medicationVariantRouter);
apiRouter.use("/suppliers", supplierRouter);
apiRouter.use("/supplier-medication-variants", supplierMedicationVariantRouter);
apiRouter.use("/purchase-orders", purchaseOrderRouter);
apiRouter.use("/purchase-order-items", purchaseOrderItemRouter);
apiRouter.use("/purchase-order-receipts", purchaseOrderReceiptRouter);
apiRouter.use("/purchase-order-receipt-items", purchaseOrderReceiptItemRouter);
apiRouter.use("/warehouse", warehouseRouter);
apiRouter.use("/inventory", inventoryRouter);

export default apiRouter;
