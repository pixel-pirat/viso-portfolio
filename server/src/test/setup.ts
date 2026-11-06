// Shared test env — runs before every test file.
// Keeps getJwtSecret() happy without needing a real .env in CI.
process.env.JWT_SECRET ??= "test-only-secret-do-not-use-in-production";
