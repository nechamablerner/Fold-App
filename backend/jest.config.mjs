export default {
  testEnvironment: "node",
  testMatch: ["**/*.test.mjs"],
  // Lambda source files are native ESM (.mjs) — no transform needed,
  // Jest's --experimental-vm-modules flag handles them directly.
  transform: {},
};
