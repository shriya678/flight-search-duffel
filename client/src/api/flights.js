export class ApiError extends Error {
  constructor(message, fields) {
    super(message);
    this.fields = fields;
  }
}

export async function searchFlights(search, { signal } = {}) {
  let response;
  try {
    response = await fetch('/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(search),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Could not reach the server. Check your connection and try again.');
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    // A non-JSON error usually means the dev proxy could not reach the Express server.
    throw new ApiError(body?.error ?? 'The flight server is not responding. Is it running?', body?.fields);
  }
  return body;
}
