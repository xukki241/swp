/**
 * Common Factories
 *
 * This module provides reusable factory utilities for the application,
 * including CRUD service factories, CRUD controller factories, and other utilities.
 */

export { default as crudServiceFactory } from "./crud-service.js";
export { default as crudControllerFactory } from "./crud-controller.js";

// Re-export for convenience
export * from "./crud-service.js";
export * from "./crud-controller.js";
