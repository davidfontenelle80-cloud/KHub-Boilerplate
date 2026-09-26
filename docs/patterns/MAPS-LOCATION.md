# Maps and Location Pattern

Use this pattern for apps that save places, pins, addresses, territories, visits, routes, or
other map-backed records. It is designed for both conventional street-address use and rural
areas where an address may be incomplete or unavailable.

---

## 1. Location validity

A record may have either:

- a usable address, or
- a latitude/longitude pair from a saved pin, or
- both.

Do not require a street address when a manually placed map pin is sufficient for the task.
GPS is optional convenience, never the only way to create a location.

For directions, prefer saved coordinates when they exist. They are usually more reliable than
re-geocoding an imprecise rural address.

---

## 2. Coordinates are implementation data

Store coordinates at useful precision internally, but do not make raw latitude/longitude the
normal user-facing label.

Normal UI should show:

1. Name/person/place.
2. Friendly address or area text when available.
3. Map pin/mini-map or "Pinned location" state.

Raw coordinates belong in diagnostics, export data, or an advanced details surface unless the
app's users genuinely need them.

---

## 3. Keep one live map instance

Creating a new map object is expensive and causes visible lag.

- Mount the map once when the map screen becomes active.
- Reuse that map while the screen remains alive.
- Do not destroy/recreate it on pan, zoom, filter changes, or tab re-renders.
- Invalidate/resize the existing map when its container changes size instead of remounting it.
- Remove event listeners and dispose the map only when the owning screen is actually destroyed.

A UI re-render must not automatically imply a map re-render.

---

## 4. Diff markers instead of rebuilding them

Every marker needs a stable record ID.

When records change:

- Add markers for new IDs.
- Update only markers whose location/content changed.
- Remove markers whose IDs disappeared.
- Leave all unchanged markers alone.

Do not clear and recreate every marker after each state change. Pan and zoom events must not
trigger a full marker rebuild.

---

## 5. Preserve the user's viewport

- Initial load may use saved viewport, current location, or a one-time `fitBounds`.
- After the user pans or zooms, preserve that view.
- Do not repeatedly call `fitBounds` merely because markers refreshed.
- Recenter only for an explicit user action such as "My location", "Show all", or selecting a
  record from another screen.

The map belongs to the user once they begin interacting with it.

---

## 6. Geocoding discipline

Network geocoding is slower than map interaction.

- Debounce typed address searches.
- Cancel or ignore stale search responses.
- Do not geocode continuously during map drag.
- Reverse-geocode on `dragend` only when the product needs a friendly address.
- Do not geocode during continuous `move` or `zoom`.
- Never block saving a pin while waiting for reverse geocoding; save coordinates first and
  enrich the label separately if needed.

Silent fuzzy guesses are not acceptable when several addresses match. Let the user choose.

---

## 7. Network/offline behavior

Saved records remain accessible when map tiles or geocoding are unavailable.

- List/card/detail views must still open.
- Saved coordinates must remain intact.
- The map surface may show a clear "Map unavailable offline" state.
- Do not treat a tile-provider error as corruption of the saved location.

If the app's main task requires a map while offline, use a mapping strategy that explicitly
supports that requirement; do not assume online tile services will work.

---

## 8. Permissions and fallbacks

For current-location permission:

- Ask only after a user action that needs location.
- Explain why the permission is useful.
- If denied, keep typed address and manual-pin workflows available.
- Do not repeatedly prompt after denial.

A user must never be trapped because GPS permission is unavailable.

---

## 9. Performance acceptance

Before shipping a map screen:

- Pan/zoom remains responsive with the app's expected marker count.
- No full map recreation occurs during a gesture.
- No geocoding requests fire continuously during a gesture.
- Filtering records changes only the necessary markers.
- Opening/closing a record sheet does not reset the viewport.
- Returning to the map restores an intentional viewport rather than a surprise recenter.
- Phone and tablet rotation do not leave the map blank, clipped, or under navigation.

Use browser performance tools when a map "feels laggy"; perceived lag is itself a valid defect.
