const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");

describe("Health Check API", () => {
  it("should return 200 OK", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("success", true);
  });

  afterAll(async () => {
    // Close mongoose connection if opened (though in this specific test we don't connect to DB explicitly,
    // some middleware might trigger something if not mocked. But app.js no longer connects DB automatically)
    await mongoose.connection.close();
  });
});
