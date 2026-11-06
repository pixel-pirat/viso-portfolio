import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { buildTestApp } from "../test/testApp";

vi.mock("../db/pool", () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
}));

import { queryOne } from "../db/pool";
import { signToken } from "../middleware/auth";
import proposalsRouter from "./proposals";

const app = buildTestApp("/api/proposals", proposalsRouter);
const mockedQueryOne = vi.mocked(queryOne);

const clientToken = signToken({ id: "client-1", email: "c1@x.com", name: "Client One", role: "client" });
const otherClientToken = signToken({ id: "client-2", email: "c2@x.com", name: "Client Two", role: "client" });
const adminToken = signToken({ id: "admin-1", email: "a@x.com", name: "Admin", role: "admin" });

const proposalRow = {
  id: "prop-1", client_id: "client-1", client_name: "Client One", client_email: "c1@x.com",
  booking_id: null, service_slug: "web", tier_id: "pro", title: "t", summary: "s", scope: [],
  price: "$1000", timeline_weeks: 4, status: "sent", created_at: new Date().toISOString(), decided_at: null,
};

beforeEach(() => mockedQueryOne.mockReset());

describe("GET /api/proposals/:id", () => {
  it("returns 401 with no auth at all", async () => {
    const res = await request(app).get("/api/proposals/prop-1");
    expect(res.status).toBe(401);
  });

  it("lets the owning client read their own proposal", async () => {
    mockedQueryOne.mockResolvedValueOnce(proposalRow);
    const res = await request(app)
      .get("/api/proposals/prop-1")
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("prop-1");
  });

  it("blocks a different client from reading someone else's proposal", async () => {
    mockedQueryOne.mockResolvedValueOnce(proposalRow);
    const res = await request(app)
      .get("/api/proposals/prop-1")
      .set("Authorization", `Bearer ${otherClientToken}`);
    expect(res.status).toBe(403);
  });

  it("lets an admin read any client's proposal", async () => {
    mockedQueryOne.mockResolvedValueOnce(proposalRow);
    const res = await request(app)
      .get("/api/proposals/prop-1")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it("returns 404 for a proposal that doesn't exist", async () => {
    mockedQueryOne.mockResolvedValueOnce(null);
    const res = await request(app)
      .get("/api/proposals/does-not-exist")
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.status).toBe(404);
  });
});
