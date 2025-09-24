import * as z from 'zod';

export enum BookingDateQueryParam {
    Upcoming = 'upcoming',
    Historical = 'historical',
}

export const CreateBookingBodySchema = z.object({
    mentorId: z.uuidv4(),
    timeSlotId: z.uuidv4(),
});
export const GetBookingsQueryParamsSchema = z.object({
    date: z.enum(BookingDateQueryParam),
});

export type CreateBookingBody = z.infer<typeof CreateBookingBodySchema>;
export type GetBookingsQueryParams = z.infer<
    typeof GetBookingsQueryParamsSchema
>;
