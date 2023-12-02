import { FastifyReply, FastifyRequest } from "fastify";
import { createApplicationBody } from "./applications.schemas";
import { createApplication, getApplications } from "./application.services";
import {
  ALL_PERMISSIONS,
  SYSTEM_ROLES,
  USER_ROLE_PERMISSIONS,
} from "../../config/permissions";
import { createRole } from "../roles/roles.services";

export async function createApplicationHandler(
  request: FastifyRequest<{ Body: createApplicationBody }>,
  _: FastifyReply
) {
  const { name } = request.body;

  const application = await createApplication({ name });

  const superAdminRolePromise = createRole({
    applicationId: application.id,
    name: SYSTEM_ROLES.SUPER_ADMIN,
    permissions: ALL_PERMISSIONS as unknown as Array<string>,
  });

  const applicationUserRolePromise = createRole({
    applicationId: application.id,
    name: SYSTEM_ROLES.APPLICATION_USER,
    permissions: USER_ROLE_PERMISSIONS,
  });

  const [superAdminRole, applicationUserRole] = await Promise.allSettled([
    superAdminRolePromise,
    applicationUserRolePromise
  ])

  if (superAdminRole.status === "rejected") {
    throw new Error("Error creating super admin role");
  }

  if (applicationUserRole.status === "rejected") {
    throw new Error("Error creating application user role");
  }

  return {
    application,
    superAdminRole: superAdminRole.value,
    applicationUserRole: applicationUserRole.value
  };
}

export async function getApplicationsHandler(
  _: FastifyRequest,
  __: FastifyReply
) {
  const result = await getApplications();
  return { result };
}
