import { TypedQueryBuilder } from "drizzle-orm/query-builders/query-builder";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const createUserBodySchema = z.object({
  email: z.string().email(),
  name: z.string(),
  applicationId: z.string().uuid(),
  password: z.string().min(6),
  initialUser: z.boolean().optional(),
})

export type CreateUserBodySchema = z.infer<typeof createUserBodySchema>;

export const createUserBodyJsonSchema = {
  body: zodToJsonSchema(createUserBodySchema, "createUserBodySchema")
  // also put eventual url params or url query strings here
}

// Login
//
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  applicationId: z.string()
})

export type LoginBody = z.infer<typeof loginSchema>;

export const loginBodyJsonSchema = {
  body: zodToJsonSchema(loginSchema, "loginSchema")
}

const assignRoleToUserBody = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
  applicationId: z.string().uuid()
});

export type AssignRoleToUserBody = z.infer<typeof assignRoleToUserBody>;

export const AssignRoleToUserBodyJson = {
  body: zodToJsonSchema(assignRoleToUserBody, "assignRoleToUserBody")
};
