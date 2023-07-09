import { z } from 'zod';

export const CategoryValidator = z.object({
  name: z.string().min(2),
  billboardId: z.string().min(1),
});

export type CatrgoryCreateRequest = z.infer<typeof CategoryValidator>;
