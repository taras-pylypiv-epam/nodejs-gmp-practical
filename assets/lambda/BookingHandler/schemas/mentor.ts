import * as z from 'zod';

export const GetAllQueryParamsSchema = z.object({
    experience: z.preprocess(
        (val) => (typeof val === 'string' ? Number.parseInt(val) : val),
        z.number().int().optional()
    ),
    skills: z.preprocess(
        (val) => (typeof val === 'string' ? val.split(',') : val),
        z.array(z.string()).optional()
    ),
});

export type GetAllQueryParams = z.infer<typeof GetAllQueryParamsSchema>;
