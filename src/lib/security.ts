import { z } from "zod";

/** Absolute http(s) URL — used for stream + outbound links. */
export const httpUrl = z
  .string()
  .url()
  .refine((v) => /^https?:\/\//i.test(v), "Must be an http(s) URL");
