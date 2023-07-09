import { z } from 'zod';

export const SizeValidator = z.object({
  name: z.string().min(2),
  value: z.string().min(1),
});

export type SizeCreateRequest = z.infer<typeof SizeValidator>;
