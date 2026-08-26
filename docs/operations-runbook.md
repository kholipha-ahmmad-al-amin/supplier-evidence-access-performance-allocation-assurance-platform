# Operations Runbook

Start the service with `PORT=65047 npm start`. It binds to `0.0.0.0` and persists records in `data/access-performance-allocation-reviews.json`. Check availability with `GET /health`.

| Condition | Expected response | Operator response |
| --- | --- | --- |
| Invalid allocation scope | 422 invalid_input | Correct request body |
| Incorrect lifecycle role | 403 forbidden | Use the required role header |
| Replayed request or invalid state | 409 invalid_state | Preserve the existing review and investigate the request ID |
| Missing review or action | 404 not_found | Confirm path and review identifier |

Before release, run `npm run check`, `npm test`, and `npm audit --omit=dev --audit-level=high`. Stop the process through SIGINT or SIGTERM so Express closes its listener cleanly.
