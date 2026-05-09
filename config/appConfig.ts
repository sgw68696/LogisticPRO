export const APP_CONFIG = {
  USE_MOCK: true, // Set to false to switch to real API
  API_BASE_URL: "https://your-api-base-url.com/api/v1",
};

// Runtime configuration setter for Settings page
export const setMockMode = (useMock: boolean) => {
  (APP_CONFIG as { USE_MOCK: boolean }).USE_MOCK = useMock;
};
