import nodeConfig from "@swapsphere/config-eslint/node";

export default [
  ...nodeConfig,
  {
    ignores: ["src/generated/**", "prisma/migrations/**"]
  }
];
