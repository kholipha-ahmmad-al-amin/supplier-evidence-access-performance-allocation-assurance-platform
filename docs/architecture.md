# Allocation Service Architecture

The service separates transport, domain policy, and persistence. Express supplies request correlation and structured error serialization. The domain service owns allocation scope validation, role gates, idempotency, and state transitions. The store writes a complete replacement document to a temporary file before atomic rename, so a valid commit cannot expose a partially written JSON document.

| State | Required role | Next state |
| --- | --- | --- |
| submitted | allocation_assessment_analyst | allocation_assessed |
| allocation_assessed | allocation_capacity_verifier | capacity_verified |
| capacity_verified | allocation_assignment_validator | assignment_validated |
| assignment_validated | allocation_authority | allocation_authorized |
| allocation_authorized | allocation_registrar | allocation_released |

The service never mutates a review before scope, actor, request identifier, and current state checks pass.
