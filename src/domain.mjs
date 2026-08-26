import { conflict, forbidden, missing } from './errors.mjs';
import { allocationScope, text } from './validation.mjs';

const transitions = {
  assessAllocation: { from: 'submitted', to: 'allocation_assessed', role: 'allocation_assessment_analyst', event: 'allocation_assessed' },
  verifyCapacity: { from: 'allocation_assessed', to: 'capacity_verified', role: 'allocation_capacity_verifier', event: 'allocation_capacity_verified' },
  validateAssignment: { from: 'capacity_verified', to: 'assignment_validated', role: 'allocation_assignment_validator', event: 'allocation_assignment_validated' },
  authorizeAllocation: { from: 'assignment_validated', to: 'allocation_authorized', role: 'allocation_authority', event: 'allocation_authorized' },
  releaseAllocation: { from: 'allocation_authorized', to: 'allocation_released', role: 'allocation_registrar', event: 'allocation_released' }
};
const timestamp = () => new Date().toISOString();
const requireRole = (actor, role) => { if (!actor?.id || actor.role !== role) throw forbidden(`role ${role} is required`); };
const requestSeen = (record, requestId) => record.events.some((event) => event.requestId === requestId);

export class AccessPerformanceAllocationService {
  constructor(store) { this.store = store; }
  submit(input, actor, requestId) {
    requireRole(actor, 'evidence_owner'); const database = this.store.read(); if (database.accessPerformanceAllocationReviews.some((record) => requestSeen(record, requestId))) throw conflict('request identifier was already used');
    const now = timestamp(); const record = { id: crypto.randomUUID(), supplierId: text(input.supplierId, 'supplier id'), evidenceReference: text(input.evidenceReference, 'evidence reference'), allocationReference: text(input.allocationReference, 'allocation reference'), allocationScope: allocationScope(input.allocationScope), status: 'submitted', createdAt: now, updatedAt: now, events: [{ type: 'access_performance_allocation_submitted', actorId: actor.id, requestId, at: now }] };
    database.accessPerformanceAllocationReviews.push(record); this.store.write(database); return record;
  }
  transition(id, action, input, actor, requestId) {
    const policy = transitions[action]; if (!policy) throw missing('action was not found'); requireRole(actor, policy.role); const database = this.store.read(); const record = database.accessPerformanceAllocationReviews.find((entry) => entry.id === id);
    if (!record) throw missing('access-performance allocation review was not found'); if (requestSeen(record, requestId)) throw conflict('request identifier was already used'); if (record.status !== policy.from) throw conflict(`access-performance allocation review must be ${policy.from}`);
    const note = text(input.note, 'note'); const now = timestamp(); record.status = policy.to; record.updatedAt = now; record.events.push({ type: policy.event, actorId: actor.id, requestId, note, at: now }); database.accessPerformanceAllocationReviews = database.accessPerformanceAllocationReviews.map((entry) => entry.id === id ? record : entry); this.store.write(database); return record;
  }
  get(id) { const record = this.store.read().accessPerformanceAllocationReviews.find((entry) => entry.id === id); if (!record) throw missing('access-performance allocation review was not found'); return record; }
}
