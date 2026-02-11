import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
        this.name = "AppError";
    }
}

export const errorHandler: ErrorHandler = (err, c) => {
    console.error(`[Error] ${err.message}`, err.stack);

    if (err instanceof AppError) {
        return c.json(
            { success: false, error: err.message },
            err.statusCode as ContentfulStatusCode
        );
    }

    if (err.name === "PrismaClientKnownRequestError") {
        const prismaErr = err as any;
        if (prismaErr.code === "P2025") {
            return c.json({ success: false, error: "Resource not found" }, 404);
        }
        if (prismaErr.code === "P2002") {
            return c.json({ success: false, error: "Resource already exists" }, 409);
        }
    }

    return c.json({ success: false, error: "Internal server error" }, 500);
};
