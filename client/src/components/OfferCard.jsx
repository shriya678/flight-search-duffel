import { dayDifference, formatDate, formatDuration, formatPrice, formatStops, formatTime } from '../utils/format.js';

const sortedClass = (base, active) => (active ? `${base} is-sorted` : base);

function SliceRow({ slice, label, highlightDeparture, highlightDuration }) {
  const dayShift = dayDifference(slice.departingAt, slice.arrivingAt);
  const flightNumbers = slice.segments.map((s) => s.flightNumber).join(' · ');
  const via = slice.segments.slice(0, -1).map((s) => s.destination);

  return (
    <div className="slice">
      {label && <div className="slice-label">{label}</div>}
      <div className="slice-row">
        <div className="slice-point">
          <div className={sortedClass('slice-time', highlightDeparture)}>{formatTime(slice.departingAt)}</div>
          <div className="slice-code">{slice.origin.iataCode}</div>
          <div className="slice-date">{formatDate(slice.departingAt)}</div>
        </div>

        <div className="slice-path">
          <span className={sortedClass('slice-duration', highlightDuration)}>{formatDuration(slice.duration)}</span>
          <span className="slice-line" />
          <span className={slice.stops === 0 ? 'slice-stops nonstop' : 'slice-stops'}>
            {formatStops(slice.stops)}
            {via.length > 0 && ` via ${via.join(', ')}`}
          </span>
        </div>

        <div className="slice-point slice-point-end">
          <div className="slice-time">
            {formatTime(slice.arrivingAt)}
            {dayShift > 0 && <sup className="day-shift">+{dayShift}</sup>}
          </div>
          <div className="slice-code">{slice.destination.iataCode}</div>
          <div className="slice-date">{formatDate(slice.arrivingAt)}</div>
        </div>
      </div>
      <div className="slice-flights">{flightNumbers}</div>
    </div>
  );
}

export default function OfferCard({ offer, sortBy, badges = [] }) {
  const isRoundTrip = offer.slices.length > 1;

  return (
    <article className="offer">
      <div className="offer-airline">
        <div className="airline-name">
          {offer.airline.logoUrl ? (
            <img src={offer.airline.logoUrl} alt="" width="32" height="32" loading="lazy" />
          ) : (
            <span className="airline-fallback">{offer.airline.iataCode}</span>
          )}
          <span>{offer.airline.name}</span>
        </div>
        {badges.length > 0 && (
          <div className="badges">
            {badges.map((badge) => (
              <span key={badge} className="badge">
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="offer-slices">
        {offer.slices.map((slice, i) => (
          <SliceRow
            key={i}
            slice={slice}
            label={isRoundTrip ? (i === 0 ? 'Outbound' : 'Return') : null}
            // "Earliest departure" sorts by the outbound flight only.
            highlightDeparture={sortBy === 'departure' && i === 0}
            highlightDuration={sortBy === 'duration'}
          />
        ))}
      </div>

      <div className="offer-price">
        <div
          className={sortedClass('price', sortBy === 'price')}
          title={offer.originalCurrency && `Original price: ${formatPrice(offer.originalAmount, offer.originalCurrency, 2)}`}
        >
          {formatPrice(offer.totalAmount, offer.totalCurrency)}
        </div>
        <div className="muted price-note">total, all passengers</div>
      </div>
    </article>
  );
}
