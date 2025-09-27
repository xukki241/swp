import { Router } from "express";
import { userController } from "../controllers/index.js";
import {
  validate,
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/index.js";
import {
  userCreateSchema,
  userUpdateProfileSchema,
  userStatusUpdateSchema,
  userBulkCreateSchema,
  userQuerySchema,
  userByRoleQuerySchema,
  idParamSchema,
  emailParamSchema,
  roleIdParamSchema,
} from "../validation/index.js";

const router = Router();

// Standard CRUD routes
router.post("/", validateBody(userCreateSchema), userController.create); // POST /users

router.get("/", validateQuery(userQuerySchema), userController.getMany); // GET /users

router.get("/count", userController.count); // GET /users/count

router.get("/active", validateQuery(userQuerySchema), userController.getActive); // GET /users/active

router.post(
  "/bulk",
  validateBody(userBulkCreateSchema),
  userController.bulkCreate
); // POST /users/bulk

router.get("/:id", validateParams(idParamSchema), userController.getById); // GET /users/:id

router.put(
  "/:id",
  validate({ params: idParamSchema, body: userCreateSchema }),
  userController.updateById
); // PUT /users/:id

router.patch(
  "/:id",
  validate({ params: idParamSchema, body: userUpdateProfileSchema }),
  userController.patchById
); // PATCH /users/:id

router.delete("/:id", validateParams(idParamSchema), userController.deleteById); // DELETE /users/:id

router.head("/:id", validateParams(idParamSchema), userController.existsById); // HEAD /users/:id

// Custom user routes
router.get(
  "/email/:email",
  validateParams(emailParamSchema),
  userController.getByEmail
); // GET /users/email/:email

router.patch(
  "/:id/status",
  validate({ params: idParamSchema, body: userStatusUpdateSchema }),
  userController.updateStatus
); // PATCH /users/:id/status

router.get(
  "/role/:roleId",
  validate({ params: roleIdParamSchema, query: userQuerySchema }),
  userController.getByRole
); // GET /users/role/:roleId

export default router;
