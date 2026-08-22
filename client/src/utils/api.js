export const parseApiResponse = async (response, fallbackMessage = "Request failed") => {
  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();

  if (!bodyText) {
    if (!response.ok) {
      throw new Error(`${fallbackMessage}. The server returned an empty response.`);
    }
    return null;
  }

  if (!contentType.includes("application/json")) {
    if (!response.ok) {
      throw new Error(`${fallbackMessage}. The server returned a non-JSON response.`);
    }
    return null;
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    throw new Error(`${fallbackMessage}. The server returned invalid JSON.`);
  }
};
