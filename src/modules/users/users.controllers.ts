import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { AssignRoleToUserBody, CreateUserBodySchema, LoginBody } from "./users.schemas";
import { SYSTEM_ROLES } from "../../config/permissions";
import { assignRoleToUser, createUser, getRoleByName, getUserByEmail, getUsersByApplicationId } from "./users.services";
import { logger } from "../../utils/logger";

export async function createUserHandler(
  request: FastifyRequest<{
    Body: CreateUserBodySchema
  }>,
  reply: FastifyReply
) {

  const { initialUser, ...data } = request.body

  const roleName = initialUser
    ? SYSTEM_ROLES.SUPER_ADMIN
    : SYSTEM_ROLES.APPLICATION_USER;

  if (roleName === SYSTEM_ROLES.SUPER_ADMIN) {
    const appUsers = await getUsersByApplicationId(data.applicationId);

    if (appUsers.length > 0) {
      return reply.code(400).send({
        message: "Application already has super admin user",
        extensions: {
          code: "APPLICATION_ALREADY_SUPER_USER",
          applicationId: data.applicationId,
        }
      })
    }
  }

  const role = await getRoleByName({
    name: roleName,
    applicationId: data.applicationId,
  });

  if (!role) {
    return reply.code(404).send({
      message: "Role not found",
    })
  }

  try {
    const user = await createUser(data);

    await assignRoleToUser({
      userId: user.id,
      roleId: role.id,
      applicationId: data.applicationId,
    });

    return user;
  } catch (e) {
    return reply.code(500).send({ message: e });
  }
};

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply) {

  const { applicationId, email, password } = request.body;

  const user = await getUserByEmail({
    applicationId, email
  });

  if (!user) {
    return reply.code(400).send({ message: "Invalid email or password" })
  }

  const token = jwt.sign({
    id: user.id,
    email,
    applicationId,
    scopes: user.permissions

  }, "secret"); // TODO change this secret or signinmethod 


  return { token };
}

export async function assignRoleToUserHandler(
  request: FastifyRequest<{
    Body: AssignRoleToUserBody;
  }>, reply: FastifyReply
) {
  const { userId, roleId, applicationId } = request.body;

  try {
    const result = await assignRoleToUser({
      userId,
      applicationId,
      roleId
    });
    return result;
  } catch (e) {
    logger.error(e, "error assigning role to user");
    return reply.code(400).send({
      message: "could not assign role to user"
    })
  }
}