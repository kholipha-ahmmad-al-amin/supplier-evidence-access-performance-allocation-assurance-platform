import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.mjs';
import { AccessPerformanceAllocationService } from '../src/domain.mjs';

class MemoryStore { constructor() { this.database = { accessPerformanceAllocationReviews: [] }; } read() { return structuredClone(this.database); } write(data) { this.database = structuredClone(data); } }
const headers = { 'x-actor-id': 'owner-http-844', 'x-actor-role': 'evidence_owner', 'x-request-id': 'request-http-844' };
const body = { supplierId: 'SUP-844', evidenceReference: 'EVD-844', allocationReference: 'ALC-844-ACCESS-01', allocationScope: 'access_capacity_allocation' };
const route = '/access-performance-allocation-reviews';

describe('access-performance allocation HTTP transport', () => {
  it('returns the supplied request identifier and submitted allocation review', async () => { const app = createApp(new AccessPerformanceAllocationService(new MemoryStore())); const response = await request(app).post(route).set(headers).send(body); expect(response.status).toBe(201); expect(response.headers['x-request-id']).toBe(headers['x-request-id']); expect(response.body.status).toBe('submitted'); });
  it('returns structured invalid-input and missing-actor errors', async () => { const app = createApp(new AccessPerformanceAllocationService(new MemoryStore())); const invalid = await request(app).post(route).set(headers).send({ ...body, allocationScope: 'invalid' }); const missingActor = await request(app).post(route).set('x-request-id', 'request-missing-actor-844').send(body); expect(invalid.status).toBe(422); expect(invalid.body.error.code).toBe('invalid_input'); expect(missingActor.status).toBe(403); expect(missingActor.body.error.code).toBe('forbidden'); });
  it('returns structured not-found errors for unknown review and action', async () => { const app = createApp(new AccessPerformanceAllocationService(new MemoryStore())); const missing = await request(app).get(`${route}/missing-review-844`); const created = await request(app).post(route).set(headers).send(body); const unknown = await request(app).post(`${route}/${created.body.id}/unknownAction`).set({ 'x-actor-id': 'assessor-http-844', 'x-actor-role': 'allocation_assessment_analyst', 'x-request-id': 'request-unknown-action-844' }).send({ note: 'unknown' }); expect(missing.status).toBe(404); expect(missing.body.error.code).toBe('not_found'); expect(unknown.status).toBe(404); expect(unknown.body.error.code).toBe('not_found'); });
});
