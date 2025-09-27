import { Router } from "express";

import { userController } from "../controllers/index.js";
import {
  validate,
  validateBody,
  validateParams as validateParameters,
  validateQuery,
} from "../middleware/index.js";
import {
  userCreateSchema,
  userUpdateProfileSchema,
  userStatusUpdateSchema,
  userBulkCreateSchema,
  userQuerySchema,
  // userByRoleQuerySchema,
  idParameterSchema as idParameterSchema,
  emailParameterSchema as emailParameterSchema,
  roleIdParameterSchema as roleIdParameterSchema,
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

router.get(
  "/:id",
  validateParameters(idParameterSchema),
  userController.getById
); // GET /users/:id

router.put(
  "/:id",
  validate({ params: idParameterSchema, body: userCreateSchema }),
  userController.updateById
); // PUT /users/:id

router.patch(
  "/:id",
  validate({ params: idParameterSchema, body: userUpdateProfileSchema }),
  userController.patchById
); // PATCH /users/:id

router.delete(
  "/:id",
  validateParameters(idParameterSchema),
  userController.deleteById
); // DELETE /users/:id

router.head(
  "/:id",
  validateParameters(idParameterSchema),
  userController.existsById
); // HEAD /users/:id

// Custom user routes
router.get(
  "/email/:email",
  validateParameters(emailParameterSchema),
  userController.getByEmail
); // GET /users/email/:email

router.patch(
  "/:id/status",
  validate({ params: idParameterSchema, body: userStatusUpdateSchema }),
  userController.updateStatus
); // PATCH /users/:id/status

router.get(
  "/role/:roleId",
  validate({ params: roleIdParameterSchema, query: userQuerySchema }),
  userController.getByRole
); // GET /users/role/:roleId

export default router;
