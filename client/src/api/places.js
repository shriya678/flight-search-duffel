export async function suggestPlaces(query, { signal } = {}) {
  const response = await fetch(`/api/places?query=${encodeURIComponent(query)}`, { signal });
  if (!response.ok) throw new Error('Could not load airport suggestions');
  const { places } = await response.json();
  return places;
}
