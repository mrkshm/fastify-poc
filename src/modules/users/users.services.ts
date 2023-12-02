import { InferInsertModel, and, eq } from "drizzle-orm";
import argon2 from "argon2";
import { applications, users, roles, usersToRoles } from "../../db/schema";
import { db } from "../../db";

export async function createUser(data: InferInsertModel<typeof users>) {

  const hashedPassword = await argon2.hash(data.password);

  const result = await db
    .insert(users)
    .values({
      ...data,
      password: hashedPassword,
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      applicationId: applications.id,
    })

  return result[0];
}

export async function getRoleByName({
  name,
  applicationId,
}: {
  name: string;
  applicationId: string;
}) {
  const result = await db
    .select()
    .from(roles)
    .where(and(eq(roles.name, name), eq(roles.applicationId, applicationId)))
    .limit(1);

  return result[0];
}

export async function getUsersByApplicationId(applicationId: string) {
  const result = db
    .select()
    .from(users)
    .where(eq(users.applicationId, applicationId));

  return result;
}


export async function assignRoleToUser(
  data: InferInsertModel<typeof usersToRoles>
) {
  const result = await db.insert(usersToRoles).values(data).returning();

  return result[0];
};

export async function getUserByEmail(
  { email, applicationId }: { email: string; applicationId: string; }
) {

  const result = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      applicationId: users.applicationId,
      roleId: roles.id,
      password: users.password,
      permissions: roles.permissions
    })
    .from(users)
    .where(
      and(
        eq(users.email, email),
        eq(users.applicationId, applicationId)
      )
    )
    .leftJoin(usersToRoles, and(
      eq(usersToRoles.userId, users.id),
      eq(usersToRoles.applicationId, applicationId)
    ))
    .leftJoin(roles,
      eq(roles.id, usersToRoles.roleId)
    );

  if (!result.length) { return null }

  const user = result.reduce((acc, curr) => {
    // Initialize accumulator with the first row's data
    if (!acc.id) {
      acc.id = curr.id;
      acc.email = curr.email;
      acc.name = curr.name;
      acc.applicationId = curr.applicationId;
      acc.roleId = curr.roleId;
      acc.password = curr.password;
      acc.permissions = new Set(curr.permissions || []);
    } else {
      // Add new permissions to the Set
      curr.permissions?.forEach(permission => acc.permissions.add(permission));
    }

    return acc;
  }, {} as Omit<(typeof result)[number], "permissions"> & { permissions: Set<string> });

  return { ...user, permissions: Array.from(user.permissions) };
}
