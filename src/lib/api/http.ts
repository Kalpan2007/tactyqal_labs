import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";

export type ApiErrorBody = {
  error: { code: string; message: string; details?: unknown };
};

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function created<T>(data: T, location?: string) {
  return NextResponse.json(data, {
    status: 201,
    headers: location ? { Location: location } : undefined,
  });
}

export function fail(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json<ApiErrorBody>({ error: { code, message, details } }, { status });
}

/**
 * Single place where an unexpected throw becomes an HTTP response, so no route
 * ever leaks a stack trace or a database error string to the client.
 */
export function handleError(err: unknown) {
  if (err instanceof ZodError) {
    return fail(422, "VALIDATION_FAILED", "The request body is not valid.", err.issues);
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[] | undefined)?.join(", ") ?? "field";
      return fail(409, "CONFLICT", `A record with that ${target} already exists.`);
    }
    if (err.code === "P2025") {
      return fail(404, "NOT_FOUND", "The record was not found.");
    }
    if (err.code === "P2003") {
      return fail(422, "INVALID_REFERENCE", "A referenced record does not exist.");
    }
  }
  console.error("[api] unhandled error", err);
  return fail(500, "INTERNAL_ERROR", "Something went wrong.");
}

/** Parses JSON defensively: an empty or malformed body is a 400, not a crash. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new SyntaxError("INVALID_JSON");
  }
}
