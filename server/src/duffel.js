const DUFFEL_API_URL = 'https://api.duffel.com';
const DUFFEL_VERSION = 'v2';
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_OFFERS = 50;
const MAX_PLACE_SUGGESTIONS = 8;
// Duffel needs an age for child passengers; any value in the 2-11 range prices as a child fare.
const DEFAULT_CHILD_AGE = 8;

export class DuffelError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function duffelRequest(path, { method = 'GET', body } = {}) {
  const token = process.env.DUFFEL_ACCESS_TOKEN;
  if (!token) {
    throw new DuffelError(500, 'Server is missing DUFFEL_ACCESS_TOKEN. Add it to server/.env.');
  }

  let response;
  try {
    response = await fetch(`${DUFFEL_API_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Duffel-Version': DUFFEL_VERSION,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    if (err.name === 'TimeoutError') throw new DuffelError(504, 'Duffel took too long to respond');
    throw new DuffelError(502, 'Could not reach Duffel');
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const errors = payload?.errors ?? [];
    const message = errors[0]?.message || `Duffel request failed with status ${response.status}`;
    // Auth problems are our configuration issue, not the caller's, so surface them as a bad gateway.
    const status = response.status === 401 || response.status === 403 ? 502 : response.status;
    throw new DuffelError(status, message, errors);
  }
  return payload;
}

function toDuffelPassengers({ adults, children, infants }) {
  return [
    ...Array.from({ length: adults }, () => ({ type: 'adult' })),
    ...Array.from({ length: children }, () => ({ age: DEFAULT_CHILD_AGE })),
    ...Array.from({ length: infants }, () => ({ type: 'infant_without_seat' })),
  ];
}

function toPlace(place) {
  return { iataCode: place.iata_code, name: place.name, cityName: place.city_name ?? place.city?.name ?? null };
}

function toOffer(offer) {
  return {
    id: offer.id,
    totalAmount: offer.total_amount,
    totalCurrency: offer.total_currency,
    expiresAt: offer.expires_at,
    airline: {
      name: offer.owner.name,
      iataCode: offer.owner.iata_code,
      logoUrl: offer.owner.logo_symbol_url,
    },
    slices: offer.slices.map((slice) => ({
      origin: toPlace(slice.origin),
      destination: toPlace(slice.destination),
      duration: slice.duration,
      stops: slice.segments.length - 1,
      departingAt: slice.segments[0].departing_at,
      arrivingAt: slice.segments.at(-1).arriving_at,
      segments: slice.segments.map((segment) => ({
        flightNumber: `${segment.marketing_carrier.iata_code}${segment.marketing_carrier_flight_number}`,
        carrier: segment.marketing_carrier.name,
        origin: segment.origin.iata_code,
        destination: segment.destination.iata_code,
        departingAt: segment.departing_at,
        arrivingAt: segment.arriving_at,
        duration: segment.duration,
      })),
    })),
  };
}

export async function searchFlights(search) {
  const slices = [{ origin: search.origin, destination: search.destination, departure_date: search.departureDate }];
  if (search.tripType === 'round-trip') {
    slices.push({ origin: search.destination, destination: search.origin, departure_date: search.returnDate });
  }

  const { data } = await duffelRequest('/air/offer_requests?return_offers=true', {
    method: 'POST',
    body: {
      data: {
        slices,
        passengers: toDuffelPassengers(search.passengers),
        cabin_class: search.cabinClass,
      },
    },
  });

  const offers = [...data.offers]
    .sort((a, b) => Number(a.total_amount) - Number(b.total_amount))
    .slice(0, MAX_OFFERS)
    .map(toOffer);

  return { offerRequestId: data.id, totalOffers: data.offers.length, offers };
}

export async function suggestPlaces(query) {
  const { data } = await duffelRequest(`/places/suggestions?query=${encodeURIComponent(query)}`);

  return data
    .filter((place) => place.iata_code)
    .slice(0, MAX_PLACE_SUGGESTIONS)
    .map((place) => ({
      type: place.type,
      iataCode: place.iata_code,
      name: place.name,
      // City results have no city_name; their own name is the city.
      cityName: place.city_name || place.name,
      countryCode: place.iata_country_code,
    }));
}
