import globals from "globals";
import baseConfig from "./base.mjs";

const config = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  }
];

export default config;
