import { FastifyInstance } from "fastify";
import { CreateRoleBody, createRoleBodyJsonSchema } from "./role.schemas";
import { createRoleHandler } from "./role.controllers";
import { PERMISSIONS } from "../../config/permissions";

export async function roleRoutes(app: FastifyInstance) {
  app.post<{
    Body: CreateRoleBody;
  }>(
    "/",
    {
      schema: createRoleBodyJsonSchema,
      preHandler: [app.guard.scope([PERMISSIONS["roles:write"]])]
    },
    createRoleHandler
  );
}
