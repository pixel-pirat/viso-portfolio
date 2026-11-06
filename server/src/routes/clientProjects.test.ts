import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { buildTestApp } from "../test/testApp";

vi.mock("../db/pool", () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
}));

import { query, queryOne } from "../db/pool";
import { signToken } from "../middleware/auth";
import clientProjectsRouter from "./clientProjects";

const app = buildTestApp("/api/client-projects", clientProjectsRouter);
const mockedQuery = vi.mocked(query);
const mockedQueryOne = vi.mocked(queryOne);

const clientToken = signToken({ id: "client-1", email: "c1@x.com", name: "Client One", role: "client" });
const otherClientToken = signToken({ id: "client-2", email: "c2@x.com", name: "Client Two", role: "client" });
const adminToken = signToken({ id: "admin-1", email: "a@x.com", name: "Admin", role: "admin" });

const projectRow = {
  id: "proj-1", proposal_id: null, client_id: "client-1", client_name: "Client One",
  client_email: "c1@x.com", title: "Website", service_slug: "web", tier_id: "pro",
  stage: "kickoff", progress: 10, started_at: new Date().toISOString(),
};

beforeEach(() => {
  mockedQueryOne.mockReset();
  mockedQuery.mockReset();
  // buildClientProject() fans out to milestones/messages/invoices — keep those empty by default
  mockedQuery.mockResolvedValue([]);
});

describe("GET /api/client-projects/:id", () => {
  it("returns 401 with no auth", async () => {
    const res = await request(app).get("/api/client-projects/proj-1");
    expect(res.status).toBe(401);
  });

  it("lets the owning client read their own project", async () => {
    mockedQueryOne.mockResolvedValueOnce(projectRow);
    const res = await request(app)
      .get("/api/client-projects/proj-1")
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("proj-1");
  });

  it("blocks a different client from reading someone else's project", async () => {
    mockedQueryOne.mockResolvedValueOnce(projectRow);
    const res = await request(app)
      .get("/api/client-projects/proj-1")
      .set("Authorization", `Bearer ${otherClientToken}`);
    expect(res.status).toBe(403);
  });

  it("lets an admin read any client's project", async () => {
    mockedQueryOne.mockResolvedValueOnce(projectRow);
    const res = await request(app)
      .get("/api/client-projects/proj-1")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});

describe("POST /api/client-projects/:id/messages", () => {
  it("blocks a non-owning client from posting a message into someone else's project", async () => {
    mockedQueryOne.mockResolvedValueOnce({ client_id: "client-1" }); // project lookup
    const res = await request(app)
      .post("/api/client-projects/proj-1/messages")
      .set("Authorization", `Bearer ${otherClientToken}`)
      .send({ body: "hi" });
    expect(res.status).toBe(403);
  });

  it("lets the owning client post a message", async () => {
    mockedQueryOne.mockResolvedValueOnce({ client_id: "client-1" }); // project lookup
    mockedQuery.mockResolvedValueOnce([{ id: "msg-1" }]); // insert
    const res = await request(app)
      .post("/api/client-projects/proj-1/messages")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ body: "hi" });
    expect(res.status).toBe(201);
  });
});
