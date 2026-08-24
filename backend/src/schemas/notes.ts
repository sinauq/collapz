import { z } from "zod";

export const idParamsScheme = z.object({
  id: z.coerce.number().int().positive(),
});

export const createNoteSchema = z.object({
  title: z.string(),
  content: z.string(),
  owner: z.string(),
});

export const updateNoteSchema = z
  .object({
    title: z.string().optional(),
    content: z.string().optional(),
  })
  .refine((data) => data.title != undefined || data.content != undefined, {
    message: "At least one field must be provided.",
  });

export type CreateNoteBody = z.infer<typeof createNoteSchema>;
export type UpdateNoteBody = z.infer<typeof updateNoteSchema>;

export const linkParams = z.object({
  id: z.coerce.number().int().positive(),
  linkId: z.coerce.number().int().positive(),
});

export const createNoteLink = z.object({
  targetId: z.number(),
  relationship: z.string(),
});

export const updateNoteLink = z.object({
  relationship: z.string(),
});

export const notesQueryParams = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export type NotesQueryParams = z.infer<typeof notesQueryParams>;

export const usersQueryParams = z.object({
  search: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const createUserSchema = z.object({
  name: z.string(),
  role: z.string(),
});

export const updateUserSchema = z
  .object({
    name: z.string().optional(),
    role: z.string().optional(),
  })
  .refine((data) => data.role != undefined || data.name != undefined, {
    message: "At least one field must be provided.",
  });
