import { z } from "zod";
import { ObjectExtendsSchema } from "./ObjectExtendsSchema";
import { ObjectPropertySchema } from "./ObjectPropertySchema";

// for inline payload schemas, you need either extends/properties (or both).
export const WebhookInlinedPayloadSchema = z.union([
    z.strictObject({
        name: z.string(),
        extends: ObjectExtendsSchema,
        properties: z.optional(z.record(ObjectPropertySchema)),
    }),
    z.strictObject({
        name: z.string(),
        extends: z.optional(ObjectExtendsSchema),
        properties: z.record(ObjectPropertySchema),
    }),
]);

export type WebhookInlinedPayloadSchema = z.infer<typeof WebhookInlinedPayloadSchema>;
