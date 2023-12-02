import { FastifyInstance } from "fastify";
import { assignRoleToUserHandler, createUserHandler, loginHandler } from "./users.controllers";
import { AssignRoleToUserBodyJson, createUserBodyJsonSchema, loginBodyJsonSchema } from "./users.schemas";

export async function usersRoutes(app: FastifyInstance) {
  app.post(
    "/", {
    schema: createUserBodyJsonSchema
  },
    createUserHandler
  );

  app.post(
    "/login", {
    schema: loginBodyJsonSchema,
  },
    loginHandler
  )

  app.post(
    "/roles", {
    schema: AssignRoleToUserBodyJson
  },
    assignRoleToUserHandler
  )
}

