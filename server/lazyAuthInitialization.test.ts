import { describe, expect, it } from "vitest";
import type { Request } from "express";
import { hasAuthenticationMaterial } from "./_core/context";

function requestWithHeaders(headers: Request["headers"]): Request {
  return { headers } as Request;
}

describe("lazy authentication initialization", () => {
  it("does not load authentication for an ordinary public request", () => {
    expect(hasAuthenticationMaterial(requestWithHeaders({}))).toBe(false);
  });

  it("detects the CasinoVerse session cookie", () => {
    expect(
      hasAuthenticationMaterial(
        requestWithHeaders({ cookie: "other=value; app_session_id=encoded-session" }),
      ),
    ).toBe(true);
  });

  it("detects a bearer session used by embedded previews", () => {
    expect(
      hasAuthenticationMaterial(
        requestWithHeaders({ authorization: "Bearer encoded-session" }),
      ),
    ).toBe(true);
  });

  it("ignores unrelated cookies and malformed authorization", () => {
    expect(
      hasAuthenticationMaterial(
        requestWithHeaders({ cookie: "other=value", authorization: "Basic encoded" }),
      ),
    ).toBe(false);
  });
});
