module.exports = {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },

  moduleNameMapper: {
    "\\.(css)$": "identity-obj-proxy",
  },

  setupFilesAfterEnv: ["@testing-library/jest-dom"],
};
