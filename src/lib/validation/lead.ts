import { z } from "zod";

/** The homepage consultation form. Kept deliberately small: name, how to reach you, context. */
export const createLeadSchema = z.object({
  parentName: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.email("Please enter a valid email address.").max(200),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .max(20)
    .regex(/^[+\d][\d\s()-]*$/, "Please enter a valid phone number."),
  studentAge: z.string().trim().min(1, "Please enter your child's age.").max(40),
  idea: z.string().trim().max(2000).optional().nullable(),
  source: z.string().trim().max(60).default("homepage"),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
