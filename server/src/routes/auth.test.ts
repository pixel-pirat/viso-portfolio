import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { buildTestApp } from "../test/testApp";

vi.mock("../db/pool", () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
}));

import { query, queryOne } from "../db/pool";
import authRouter from "./auth";

const app = buildTestApp("/api/auth", authRouter);
const mockedQuery = vi.mocked(query);
const mockedQueryOne = vi.mocked(queryOne);

beforeEach(() => {
  mockedQuery.mockReset();
  mockedQueryOne.mockReset();
});

describe("POST /api/auth/register", () => {
  it("always creates a client account, even if the request tries role=admin", async () => {
    // regression test for the register-time privilege-escalation fix
    mockedQueryOne.mockResolvedValueOnce(null); // no existing account
    mockedQuery.mockResolvedValueOnce([
      { id: "acct-1", name: "Eve", email: "eve@example.com", role: "client" },
    ]);

    const res = await request(app).post("/api/auth/register").send({
      name: "Eve",
      email: "eve@example.com",
      password: "password123",
      role: "admin",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("client");

    const [sql, params] = mockedQuery.mock.calls[0];
    expect(sql).toMatch(/INSERT INTO accounts/);
    expect(sql).toMatch(/'client'/); // role is hard-coded in the query, not bound
    expect(params).not.toContain("admin");
  });

  it("never returns the JWT in the response body (cookie-only)", async () => {
    mockedQueryOne.mockResolvedValueOnce(null);
    mockedQuery.mockResolvedValueOnce([
      { id: "acct-1", name: "Eve", email: "eve@example.com", role: "client" },
    ]);

    const res = await request(app).post("/api/auth/register").send({
      name: "Eve",
      email: "eve@example.com",
      password: "password123",
    });

    expect(res.body.token).toBeUndefined();
    const cookie = res.headers["set-cookie"]?.[0] ?? "";
    expect(cookie).toMatch(/token=.+HttpOnly/i);
  });

  it("rejects a duplicate email with 409", async () => {
    mockedQueryOne.mockResolvedValueOnce({ id: "existing-1" });

    const res = await request(app).post("/api/auth/register").send({
      name: "Eve",
      email: "eve@example.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
  });

  it("rejects an invalid payload with 422", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "",
      email: "not-an-email",
      password: "short",
    });

    expect(res.status).toBe(422);
    expect(mockedQuery).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/login", () => {
  it("rejects an unknown email with 401", async () => {
    mockedQueryOne.mockResolvedValueOnce(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "whatever" });

    expect(res.status).toBe(401);
  });

  it("rejects a wrong password with 401", async () => {
    const hash = await bcrypt.hash("correct-password", 4);
    mockedQueryOne.mockResolvedValueOnce({
      id: "acct-1", name: "Eve", email: "eve@example.com", role: "client", password_hash: hash,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "eve@example.com", password: "wrong-password" });

    expect(res.status).toBe(401);
  });

  it("logs in with correct credentials, sets a cookie, and doesn't leak the token in the body", async () => {
    const hash = await bcrypt.hash("correct-password", 4);
    mockedQueryOne.mockResolvedValueOnce({
      id: "acct-1", name: "Eve", email: "eve@example.com", role: "client", password_hash: hash,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "eve@example.com", password: "correct-password" });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("eve@example.com");
    expect(res.body.token).toBeUndefined();
    expect(res.headers["set-cookie"]?.[0]).toMatch(/token=/);
  });
});

describe("GET /api/auth/me", () => {
  it("returns 401 with no token at all", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 with a garbage token", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });
});
