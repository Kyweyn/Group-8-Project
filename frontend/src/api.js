// api.js - one small helper so we do not write fetch() with the same headers
// in every single component.
//
// It does three things for us:
//   1. puts the backend address in front of the path
//   2. adds the "Authorization: Bearer <token>" header when we are logged in
//   3. turns an error answer from the API into a real JS error with the
//      message the backend sent, so the pages can show it to the user

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, token } = options;

  const headers = {};
  if (body) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  let response;
  try {
    response = await fetch(API_URL + path, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // fetch() only throws when the server cannot be reached at all
    // (wrong port, backend not started, no network)
    throw new Error("Cannot reach the server. Is the API running on port 3001?");
  }

  // some answers (like a 204) have no body at all, so we read the text first
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      data = null;
    }
  }

  if (!response.ok) {
    // our backend always answers { "error": "..." } when something is wrong
    const message =
      (data && data.error) || "Something went wrong (" + response.status + ")";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}
