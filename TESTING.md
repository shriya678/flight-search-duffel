# Testing

## API (Postman)

See the Postman section in the [README](README.md#postman). The collection covers success, validation and Duffel error cases.

## Browser test cases

Run `npm run dev` and open http://localhost:5173. Use Chrome DevTools (F12) where a case mentions the Network tab or device mode.

### A. Page layout

| # | Steps | Expected |
| --- | --- | --- |
| A1 | Open the app | Header with logo and nav, blue hero, white search card with an active "Flights" tab |
| A2 | Resize to under 860px wide | Fields stack into 2 columns; From/To stays on one full-width row |
| A3 | Resize to under 640px (or device mode, iPhone) | Nav links hidden, Search button full width, no horizontal scroll |
| A4 | Open the Console | No errors or React warnings |

### B. Trip type

| # | Steps | Expected |
| --- | --- | --- |
| B1 | Load the page | "One Way" selected, Return shows "Add a return flight" |
| B2 | Click "Round Trip" | Return becomes a date input |
| B3 | Click the "Add a return flight" field while on One Way | Switches to Round Trip and shows the return date input |
| B4 | Pick a return date, then switch back to One Way, then Round Trip again | Return date is cleared |

### C. From / To fields

| # | Steps | Expected |
| --- | --- | --- |
| C1 | Load the page | From = DEL with "New Delhi · Indira Gandhi International Airport" below; To is empty with the placeholder "Going to?" |
| C2 | Type `mumbai` in To | A dropdown lists Mumbai (BOM) and Navi Mumbai (NMI) |
| C3 | Click "Mumbai … BOM" | To shows `BOM` with "Mumbai · Chhatrapati Shivaji International Airport" below; dropdown closes |
| C4 | Type `bom` in To and click outside without picking | To keeps `BOM` (an exact 3-letter code is accepted), no airport name shown |
| C5 | Fill From=DEL, To=BOM (picked from the list), click ⇄ | Codes **and** airport names swap |
| C6 | Click ⇄ with To empty | From becomes empty, To becomes DEL |

### C+. Airport autocomplete

| # | Steps | Expected |
| --- | --- | --- |
| C7 | Click into From | Text is selected so you can type over it; no dropdown yet |
| C8 | Type one letter `l` | No dropdown (minimum 2 characters) |
| C9 | Type `lon` | "Searching…" briefly, then London "All airports" (LON) plus London airports such as LHR, STN, LTN |
| C10 | Type quickly `l-o-n-d-o-n` and watch the Network tab | Only 1-2 `/api/places` requests, not one per key (requests are debounced) |
| C11 | Use ↓ / ↑ on the list | Highlight moves and wraps from last to first |
| C12 | Highlight an item and press Enter | That airport is picked; the form is **not** submitted |
| C13 | With the list open, press Escape | List closes; typing again reopens it |
| C14 | Type `zzzzqq` | "No airports found" |
| C15 | Type `mumbai`, click outside without picking, then click Search | "Pick an airport from the list" under that field |
| C16 | Pick London (LON) → New Delhi (DEL), Search | Results depart from different London airports (LHR, LGW…) |
| C17 | Stop the server, type `mum` | "Couldn't load suggestions. Type a 3-letter code." |
| C18 | Hover over a suggestion, then click it | Hovered row is highlighted; clicking picks it |

### D. Dates

| # | Steps | Expected |
| --- | --- | --- |
| D1 | Load the page | Departure defaults to today |
| D2 | Open the departure picker | Past dates are disabled |
| D3 | Round Trip: set departure, open the return picker | Dates before the departure date are disabled |
| D4 | Round Trip: type a return date earlier than departure (keyboard), click Search | "Return must be after departure" |
| D5 | Round Trip with no return date, click Search | "Choose a return date" |
| D6 | Clear the departure date, click Search | "Choose a departure date" |

### E. Travellers and class

| # | Steps | Expected |
| --- | --- | --- |
| E1 | Load the page | Shows "1 Passenger" and "Economy" |
| E2 | Open Travellers | Popover shows Adults 1, Children 0, Infants 0 and a cabin class select |
| E3 | Try to lower Adults below 1 | Minus button disabled at 1 |
| E4 | Add passengers until the total is 9 | All plus buttons are disabled |
| E5 | Set 2 adults, 1 child | Trigger shows "3 Passengers" |
| E6 | Set 1 adult, 2 infants, click Search | "Each infant needs an adult" |
| E7 | Change cabin to Business | Trigger shows "Business" |
| E8 | Click outside the popover | Popover closes |
| E9 | Click "Done" | Popover closes |

### F. Submitting

| # | Steps | Expected |
| --- | --- | --- |
| F1 | Leave To empty, click Search | Error under To only; no request in the Network tab |
| F2 | Set To = DEL (same as From), click Search | "Destination must differ from origin" |
| F3 | Before submitting, type a bad value | No error shown yet (errors appear only after the first submit) |
| F4 | After a failed submit, fix the field | The error clears as you type |
| F5 | Fill every field correctly, press Enter in the To field | Form submits (same as clicking Search) |

### G. Search results

Prices are shown in INR, converted from the Duffel account currency (GBP) at the daily ECB rate. Airlines are simulated in test mode.

| # | Steps | Expected |
| --- | --- | --- |
| G1 | One Way, DEL → BOM, a date ~30 days ahead, Search | Button shows "Searching…" and is disabled; 3 shimmering placeholder cards appear |
| G2 | Wait for G1 to finish | "N flights found" heading and a list of cards, cheapest first |
| G3 | Check the Network tab during G1 | One `POST /api/flights/search` to localhost; **no** request to `api.duffel.com`, no `Authorization` header |
| G4 | Look at a result card | Airline logo + name, departure/arrival time, airport codes, dates, duration (e.g. "2h 5m"), stops, flight number(s), price |
| G5 | Find a non-stop flight | "Non-stop" shown in green |
| G6 | Find a flight with stops | "1 stop via XXX" with the connecting airport |
| G7 | Find an overnight flight (arrival next day) | Red "+1" next to the arrival time |
| G8 | Round Trip LHR → JFK, return a week later | Each card has "Outbound" and "Return" rows; heading says "showing the 50 cheapest" |
| G9 | DEL → BOM, sort by "Fastest" | Cards reorder by total flight time; durations are highlighted in blue |
| G10 | Sort by "Earliest departure" | Cards reorder by outbound departure time; departure times are highlighted |
| G11 | Sort back to "Cheapest" | Cards are in ascending price order; prices are highlighted |
| G11a | Two flights with the same departure time or duration | The cheaper one comes first |
| G11b | Look at the cards after any search with 2+ results | Green "Cheapest", "Fastest" and "Earliest" badges, each on exactly one card (one card can have several) |
| G11c | Search a route with few results where one flight is best at everything (e.g. NMI → RPR) | That card shows all three badges, and the order is the same under every sort. This is expected, not a bug. |
| G12 | 2 adults + 1 child, Business, Search | Prices are higher than for 1 adult economy (price is the total for all passengers) |
| G13 | Run a second search with a different route | The old results are replaced by loading cards, then the new results |
| G14 | Resize to mobile width with results shown | Cards stack: airline, then flight rows, then price; no horizontal scroll |
| G15 | Look at prices after a search | Shown in rupees with Indian grouping, e.g. "₹8,731" |
| G16 | Look above the result list | "Prices converted from GBP at 1 GBP = ₹127.89 (ECB rate, …)" |
| G17 | Hover over a price | Tooltip shows the original price, e.g. "Original price: £68.27" |

### H. Errors

| # | Steps | Expected |
| --- | --- | --- |
| H1 | Search From = `ZZZ`, To = BOM | Red error message from Duffel about an invalid IATA code, plus a "Try again" button |
| H2 | Stop the server (Ctrl+C), then Search | "The flight server is not responding. Is it running?" |
| H3 | Restart the server, click "Try again" | The same search runs again and results appear |
| H4 | Put a wrong token in `server/.env`, restart, Search | Error message shown (Duffel auth error), the app doesn't crash |
| H5 | DevTools → Network → throttling "Slow 4G", Search | Loading state stays visible until results arrive |

### I. Deployed site (Vercel)

Run these on `https://<project>.vercel.app` after deploying.

| # | Steps | Expected |
| --- | --- | --- |
| I1 | Open `/api/health` | `{"ok":true,"duffelConfigured":true}` |
| I2 | Open the site and search DEL → BOM | Results load (the first search may take a second or two longer) |
| I3 | DevTools → Network during a search | Requests go to the same domain under `/api`; nothing to `api.duffel.com` |
| I4 | DevTools → Sources, search the JS bundle for `duffel_` | Not found; the token is not in the frontend |
| I5 | Type `mumbai` in To | Airport suggestions appear |
| I6 | Run the Postman collection with `baseUrl` set to the Vercel URL | All tests pass |
| I7 | Push a commit to a feature branch | No new Vercel deployment is created; only `main` deploys |
