const IATA_CODE = /^[A-Z]{3}$/;
export const MAX_PASSENGERS = 9;

export function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

// Returns an object keyed by field name; empty object means the search is valid.
export function validateSearch(search) {
  const errors = {};
  const { tripType, origin, destination, departureDate, returnDate, passengers } = search;

  if (!IATA_CODE.test(origin)) errors.origin = 'Pick an airport from the list';
  if (!IATA_CODE.test(destination)) errors.destination = 'Pick an airport from the list';
  if (!errors.origin && !errors.destination && origin === destination) {
    errors.destination = 'Destination must differ from origin';
  }

  if (!departureDate) errors.departureDate = 'Choose a departure date';
  else if (departureDate < todayISO()) errors.departureDate = 'Date cannot be in the past';

  if (tripType === 'round-trip') {
    if (!returnDate) errors.returnDate = 'Choose a return date';
    else if (departureDate && returnDate < departureDate) {
      errors.returnDate = 'Return must be after departure';
    }
  }

  const { adults, children, infants } = passengers;
  if (adults < 1) errors.passengers = 'At least one adult is required';
  else if (infants > adults) errors.passengers = 'Each infant needs an adult';
  else if (adults + children + infants > MAX_PASSENGERS) {
    errors.passengers = `Maximum ${MAX_PASSENGERS} passengers`;
  }

  return errors;
}
