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
| C1 | Load the page | From = DEL, To is empty with the placeholder "Going to?" |
| C2 | Type `bom` in To | Shows `BOM` (uppercased) |
| C3 | Type `b0m-1x` in To | Digits and symbols are removed |
| C4 | Type `BOMBAY` in To | Stops at 3 letters: `BOM` |
| C5 | Fill From=DEL, To=BOM, click ⇄ | From=BOM, To=DEL |
| C6 | Click ⇄ with To empty | From becomes empty, To becomes DEL |

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
