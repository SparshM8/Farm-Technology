import { v4 as uuidv4 } from 'uuid';

export function generateId() {
  return uuidv4();
}

export function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
