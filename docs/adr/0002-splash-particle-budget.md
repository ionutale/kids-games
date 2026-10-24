---
status: proposed
---

# Splash runs on a fixed particle budget

Splash used to spawn three or six emoji on every pointermove and keep each one for 3.5 seconds, reaching roughly 1,260 live spans during a drag and stuttering on an iPhone XR. We cap the effect at 40 live particles for ages 3-5 and 20 for age 2, evict the oldest when the cap is hit, and set cadence and lifetime to target about 39 and 20 live. The cost is a shorter, sparser trail; the benefit is a testable 30fps floor on the XR.

## Consequences

- The budget is fixed on every device, so desktop gets the same density as the phone.
- The cap is a ceiling; cadence and lifetime set the target density. To raise density, shorten the interval, not just the cap.
- `?debug=1` exposes the FPS and live-count HUD used for the XR measurement.
- The XR run may tune the cap to 50 or 60. Update this ADR with the final measured values.
