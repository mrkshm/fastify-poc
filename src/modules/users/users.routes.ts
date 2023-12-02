import { FastifyInstance } from "fastify";
import { assignRoleToUserHandler, createUserHandler, loginHandler } from "./users.controllers";
import { AssignRoleToUserBody, AssignRoleToUserBodyJson, createUserBodyJsonSchema, loginBodyJsonSchema } from "./users.schemas";
import { PERMISSIONS } from "../../config/permissions";

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

  app.post<{
    Body: AssignRoleToUserBody
  }>(
    "/roles", {
    schema: AssignRoleToUserBodyJson,
    preHandler: [app.guard.scope(PERMISSIONS["users:roles:write"])]
  },
    assignRoleToUserHandler
  )
}

