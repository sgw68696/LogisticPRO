export const APP_CONFIG = {
  USE_MOCK: true,
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
};

// Runtime configuration setter for Settings page
export const setMockMode = (useMock: boolean) => {
  (APP_CONFIG as { USE_MOCK: boolean }).USE_MOCK = useMock;
};
