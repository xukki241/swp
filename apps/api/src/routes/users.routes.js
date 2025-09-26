import { Router } from "express";
import { userController } from "../controllers/index.js";
import {
  validateBody,
  validateParams,
  validateQuery,
  validateBodyAndParams,
  validateParamsAndQuery,
} from "../validation/middleware/validate.js";
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  getUserByIdParamsSchema,
  getUserByEmailParamsSchema,
  getUserByRoleParamsSchema,
  getUsersQuerySchema,
  bulkCreateUsersSchema,
} from "../validation/schemas/users.js";

const router = Router();

// Standard CRUD routes with validation
router.post("/", validateBody(createUserSchema), userController.create); // POST /users
router.get("/", validateQuery(getUsersQuerySchema), userController.getMany); // GET /users
router.get("/count", userController.count); // GET /users/count
router.get(
  "/active",
  validateQuery(getUsersQuerySchema),
  userController.getActive
); // GET /users/active
router.post(
  "/bulk",
  validateBody(bulkCreateUsersSchema),
  userController.bulkCreate
); // POST /users/bulk

router.get(
  "/:id",
  validateParams(getUserByIdParamsSchema),
  userController.getById
); // GET /users/:id
router.put(
  "/:id",
  validateBodyAndParams(updateUserSchema, getUserByIdParamsSchema),
  userController.updateById
); // PUT /users/:id
router.patch(
  "/:id",
  validateBodyAndParams(updateUserSchema, getUserByIdParamsSchema),
  userController.patchById
); // PATCH /users/:id
router.delete(
  "/:id",
  validateParams(getUserByIdParamsSchema),
  userController.deleteById
); // DELETE /users/:id
router.head(
  "/:id",
  validateParams(getUserByIdParamsSchema),
  userController.existsById
); // HEAD /users/:id

// Custom user routes with validation
router.get(
  "/email/:email",
  validateParams(getUserByEmailParamsSchema),
  userController.getByEmail
); // GET /users/email/:email
router.patch(
  "/:id/status",
  validateBodyAndParams(updateUserStatusSchema, getUserByIdParamsSchema),
  userController.updateStatus
); // PATCH /users/:id/status
router.get(
  "/role/:roleId",
  validateParamsAndQuery(getUserByRoleParamsSchema, getUsersQuerySchema),
  userController.getByRole
); // GET /users/role/:roleId

export default router;
