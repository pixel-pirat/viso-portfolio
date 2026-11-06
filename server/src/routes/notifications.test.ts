import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { buildTestApp } from "../test/testApp";

vi.mock("../db/pool", () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
}));

import { query } from "../db/pool";
import { signToken } from "../middleware/auth";
import notificationsRouter from "./notifications";

const app = buildTestApp("/api/notifications", notificationsRouter);
const mockedQuery = vi.mocked(query);

const clientToken = signToken({ id: "client-1", email: "c1@x.com", name: "Client One", role: "client" });
const adminToken = signToken({ id: "admin-1", email: "a@x.com", name: "Admin", role: "admin" });

beforeEach(() => mockedQuery.mockReset());

describe("POST /api/notifications", () => {
  // regression test — this used to be requireAuth, letting any logged-in
  // client broadcast a notification to anyone
  it("blocks a regular client from broadcasting a notification", async () => {
    const res = await request(app)
      .post("/api/notifications")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ kind: "message", title: "hi", audience: "admin" });
    expect(res.status).toBe(403);
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it("allows an admin to broadcast a notification", async () => {
    mockedQuery.mockResolvedValueOnce([{ id: "notif-1" }]);
    const res = await request(app)
      .post("/api/notifications")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ kind: "message", title: "hi", audience: "admin" });
    expect(res.status).toBe(201);
  });

  it("blocks an anonymous request", async () => {
    const res = await request(app)
      .post("/api/notifications")
      .send({ kind: "message", title: "hi" });
    expect(res.status).toBe(401);
  });
});
