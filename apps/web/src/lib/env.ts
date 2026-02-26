const required = (value: string | undefined, fallback: string): string => {
  return value && value.length > 0 ? value : fallback;
};

export const clientEnv = {
  appName: required(import.meta.env.VITE_APP_NAME, "SwapSphere"),
  apiBaseUrl: required(import.meta.env.VITE_API_BASE_URL, "/api/v1")
};
