import { FastifyInstance } from "fastify";
import { CreateRoleBody, createRoleBodyJsonSchema } from "./role.schemas";
import { createRoleHandler } from "./role.controllers";

export async function roleRoutes(app: FastifyInstance) {
  app.post<{
    Body: CreateRoleBody;
  }>(
    "/",
    {
      schema: createRoleBodyJsonSchema,
    },
    createRoleHandler
  );
}
