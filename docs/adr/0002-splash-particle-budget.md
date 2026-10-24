---
status: proposed
---

# Splash runs on a fixed particle budget

Splash used to spawn three or six emoji on every pointermove and keep each one for 3.5 seconds, reaching roughly 1,260 live spans during a drag and stuttering on an iPhone XR. We cap the effect at 40 live particles for ages 3-5 and 20 for age 2, evict the oldest when the cap is hit, and set cadence and lifetime to target about 39 and 20 live. The cost is a shorter, sparser trail; the benefit is a budget that can be measured against a 30fps floor on the XR.

## Consequences

- The budget is fixed on every device, so desktop gets the same density as the phone.
- The cap is a ceiling; cadence and lifetime set the target density. To raise density, shorten the interval, not just the cap.
- `?debug=1` exposes the FPS and live-count HUD used for the XR measurement.
- When the cap is hit, the oldest particle is removed immediately. At steady state it is already nearly transparent; rapid tapping can occasionally make one pop out.
- A held finger no longer drips particles; Splash follows movement. This is a deliberate change from the original design spec's "hold for continuous effect".
- The XR run may raise the target live count to 50 or 60 by shortening the interval and raising the cap. Update this ADR with the final values.

## Measurement

Build the production app (`pnpm build`), deploy a Vercel preview, and open `/games/splash?debug=1` on a real iPhone XR with sound on. Cold-load, use age 3, then drag continuously for the full 10 seconds. Release and read the HUD: FPS, p95, worst, and peak freeze at pointer-up; live continues to drain. Pass: FPS >= 30, p95 <= 50ms, worst <= 200ms, peak <= cap. Repeat at age 2. If age 3 passes, shorten the interval to target 50 live and re-measure, then 60, keeping the highest passing target. Update this ADR with the final values and change the status to accepted.
