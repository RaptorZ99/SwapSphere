import globals from "globals";
import baseConfig from "./base.mjs";

const config = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
];

export default config;
