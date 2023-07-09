import { z } from 'zod';

export const ColorValidator = z.object({
  name: z.string().min(2),
  value: z.string().min(1),
});

export type ColorCreateRequest = z.infer<typeof ColorValidator>;
