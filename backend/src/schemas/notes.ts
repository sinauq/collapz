import { z } from "zod";

export const noteParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createNoteSchema = z.object({
  title: z.string(),
  content: z.string(),
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
