import { inputError } from './errors.mjs';

export const text = (value, name) => {
  if (typeof value !== 'string' || !value.trim()) throw inputError(`${name} is required`);
  return value.trim();
};

export const allocationScope = (value) => {
  value = text(value, 'allocation scope');
  if (!['access_capacity_allocation', 'evidence_entitlement_allocation', 'exception_route_allocation'].includes(value)) throw inputError('allocation scope is invalid');
  return value;
};

export const actor = (headers) => ({ id: headers['x-actor-id'], role: headers['x-actor-role'] });
