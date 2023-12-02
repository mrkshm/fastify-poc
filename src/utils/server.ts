import fastify from "fastify";
import guard from "fastify-guard";
import { logger } from "./logger";
import { applicationRoutes } from "../modules/applications/applications.router";
import { usersRoutes } from "../modules/users/users.routes";
import { roleRoutes } from "../modules/roles/role.routes";
import jwt from "jsonwebtoken";

type User = {
  id: string,
  applicationId: string,
  scropes: Array<string>;
}

declare module "fastify" {
  interface FastifyRequest {
    user: User
  }
}

export async function buildServer() {
  const app = fastify({
    logger
  });

  app.decorateRequest('user', null);

  app.addHook("onRequest", async function(request, reply) {

    const authHeader = request.headers.authorization;

    if (!authHeader) { return };

    try {
      const token = authHeader.replace("Bearer", "");
      // TODO replace the following with different signing algo
      const decoded = jwt.verify(token, "secret") as User;
      request.user = decoded;
    } catch (error) {
      return reply.status(405).send("user not decoded");
    }
  })

  // register plugins
  // app.register(guard, {
  //
  //   requestProperty: "user",
  //   scopeProperty: "scopes",
  //
  //   errorHandler: (result, request, reply) => {
  //     return reply.status(405).send("You are not allowed to do that")
  //   }
  // });

  // register routes
  app.register(applicationRoutes, { prefix: "/api/applications" });
  app.register(usersRoutes, { prefix: "/api/users" });
  app.register(roleRoutes, { prefix: "/api/roles" });

  return app;
}
