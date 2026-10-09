const IATA_CODE = /^[A-Z]{3}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TRIP_TYPES = ['one-way', 'round-trip'];
const CABIN_CLASSES = ['economy', 'premium_economy', 'business', 'first'];
const MAX_PASSENGERS = 9;

function isCount(value, min) {
  return Number.isInteger(value) && value >= min && value <= MAX_PASSENGERS;
}

function isValidDate(value) {
  return ISO_DATE.test(value) && !Number.isNaN(Date.parse(value));
}

// Mirrors the client rules, since the API can be called directly (e.g. from Postman).
// Returns { search, errors }: a normalised search object, and errors keyed by field.
export function validateSearchBody(body = {}) {
  const errors = {};
  const search = {
    tripType: body.tripType ?? 'one-way',
    origin: String(body.origin ?? '').trim().toUpperCase(),
    destination: String(body.destination ?? '').trim().toUpperCase(),
    departureDate: body.departureDate,
    returnDate: body.returnDate,
    passengers: { adults: 1, children: 0, infants: 0, ...body.passengers },
    cabinClass: body.cabinClass ?? 'economy',
  };

  if (!TRIP_TYPES.includes(search.tripType)) errors.tripType = `Must be one of: ${TRIP_TYPES.join(', ')}`;
  if (!IATA_CODE.test(search.origin)) errors.origin = 'Must be a 3-letter IATA code';
  if (!IATA_CODE.test(search.destination)) errors.destination = 'Must be a 3-letter IATA code';
  if (!errors.origin && !errors.destination && search.origin === search.destination) {
    errors.destination = 'Must differ from origin';
  }

  // Compare against UTC "yesterday" so users in timezones ahead of the server aren't rejected.
  const earliestDate = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (!isValidDate(search.departureDate)) errors.departureDate = 'Must be a date in YYYY-MM-DD format';
  else if (search.departureDate < earliestDate) errors.departureDate = 'Cannot be in the past';

  if (search.tripType === 'round-trip') {
    if (!isValidDate(search.returnDate)) errors.returnDate = 'Must be a date in YYYY-MM-DD format';
    else if (!errors.departureDate && search.returnDate < search.departureDate) {
      errors.returnDate = 'Must be on or after departureDate';
    }
  }

  const { adults, children, infants } = search.passengers;
  if (!isCount(adults, 1) || !isCount(children, 0) || !isCount(infants, 0)) {
    errors.passengers = 'adults (min 1), children and infants must be whole numbers';
  } else if (infants > adults) {
    errors.passengers = 'Cannot have more infants than adults';
  } else if (adults + children + infants > MAX_PASSENGERS) {
    errors.passengers = `Maximum ${MAX_PASSENGERS} passengers`;
  }

  if (!CABIN_CLASSES.includes(search.cabinClass)) errors.cabinClass = `Must be one of: ${CABIN_CLASSES.join(', ')}`;

  return { search, errors };
}
