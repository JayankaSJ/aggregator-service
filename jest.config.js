module.exports = {
  preset: "ts-jest", // This tells Jest to use ts-jest for TypeScript support
  testEnvironment: "node", // Set the test environment to node
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1", // Update if you have alias imports
  },
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest", // Use ts-jest for TypeScript files
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"], // Ignore node_modules and dist folders
};
