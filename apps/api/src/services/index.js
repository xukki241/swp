import userService from "./users.service.js";

const services = {
  users: userService,
};

export default services;
export { default as userService } from "./users.service.js";
