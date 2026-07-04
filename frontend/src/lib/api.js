const API_BASE_URL = import.meta.env.VITE_API_URL || "https://royal-delight.onrender.com";

export async function apiRequest(path, options = {}) {
  const { headers: customHeaders, ...requestOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(customHeaders || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export { API_BASE_URL };
