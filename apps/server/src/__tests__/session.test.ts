import { describe, expect, it } from "vitest";
import {
  extractBearerToken,
  verifySessionToken,
} from "../lib/auth/session.js";
import { SignJWT } from "jose";

describe("session validation", () => {
  describe("extractBearerToken", () => {
    it("extracts token from Bearer header", () => {
      expect(extractBearerToken("Bearer abc123")).toBe("abc123");
      expect(extractBearerToken("Bearer xyz")).toBe("xyz");
    });

    it("returns null for missing or invalid header", () => {
      expect(extractBearerToken(undefined)).toBeNull();
      expect(extractBearerToken("Basic abc")).toBeNull();
      expect(extractBearerToken("Bearer ")).toBeNull();
      expect(extractBearerToken("Bearer")).toBeNull();
    });
  });

  describe("verifySessionToken", () => {
    it("returns null when NEXTAUTH_SECRET is not set", async () => {
      const orig = process.env.NEXTAUTH_SECRET;
      delete process.env.NEXTAUTH_SECRET;
      const result = await verifySessionToken("invalid");
      process.env.NEXTAUTH_SECRET = orig;
      expect(result).toBeNull();
    });

    it("returns null for invalid token", async () => {
      process.env.NEXTAUTH_SECRET = "test-secret";
      const result = await verifySessionToken("invalid-token");
      expect(result).toBeNull();
    });

    it("returns payload for valid token", async () => {
      process.env.NEXTAUTH_SECRET = "test-secret";
      const secret = new TextEncoder().encode("test-secret");
      const token = await new SignJWT({ userId: "user-123" })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1h")
        .sign(secret);

      const result = await verifySessionToken(token);
      expect(result).toEqual({ userId: "user-123" });
    });
  });
});
