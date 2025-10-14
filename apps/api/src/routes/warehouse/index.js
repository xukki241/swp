import express from "express";

import { authenticate } from "../../middleware/checkAuth.js";

import { warehouseBinsRouter } from "./bins.js";
import { warehouseRacksRouter } from "./racks.js";
import { warehouseZonesRouter } from "./zones.js";

export const warehouseRouter = express.Router();

warehouseRouter.use(authenticate);

warehouseRouter.use(warehouseZonesRouter);
warehouseRouter.use(warehouseRacksRouter);
warehouseRouter.use(warehouseBinsRouter);

export default warehouseRouter;
