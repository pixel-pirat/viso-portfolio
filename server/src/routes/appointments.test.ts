import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { buildTestApp } from "../test/testApp";

vi.mock("../db/pool", () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
}));

import { query } from "../db/pool";
import { signToken } from "../middleware/auth";
import appointmentsRouter from "./appointments";

const app = buildTestApp("/api/appointments", appointmentsRouter);
const mockedQuery = vi.mocked(query);

const clientToken = signToken({ id: "client-1", email: "c1@x.com", name: "Client One", role: "client" });

beforeEach(() => mockedQuery.mockReset());

describe("GET /api/appointments/mine", () => {
  it("returns 401 with no auth", async () => {
    const res = await request(app).get("/api/appointments/mine");
    expect(res.status).toBe(401);
  });

  it("only ever queries by the caller's own id, never a client-supplied id", async () => {
    mockedQuery.mockResolvedValueOnce([]);
    const res = await request(app)
      .get("/api/appointments/mine")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    const [sql, params] = mockedQuery.mock.calls[0];
    expect(sql).toMatch(/WHERE client_id=\$1/);
    expect(params).toEqual(["client-1"]);
  });
});

describe("GET /api/appointments (admin list)", () => {
  it("returns 403 for a non-admin client", async () => {
    const res = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.status).toBe(403);
  });
});
