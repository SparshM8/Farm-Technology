// Validation rules
export const validators = {
  required: (msg = 'This field is required') => (value) => {
    return !value ? msg : null;
  },
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !emailRegex.test(value) ? 'Invalid email format' : null;
  },
  minLength: (min, msg) => (value) => {
    return value && value.length < min ? msg || `Minimum ${min} characters required` : null;
  },
  maxLength: (max, msg) => (value) => {
    return value && value.length > max ? msg || `Maximum ${max} characters` : null;
  },
  phone: (value) => {
    const phoneRegex = /^[0-9]{10}$/;
    return value && !phoneRegex.test(value) ? 'Invalid phone number' : null;
  },
  number: (value) => {
    return value && isNaN(value) ? 'Must be a number' : null;
  },
  positive: (value) => {
    return value && value <= 0 ? 'Must be a positive number' : null;
  },
};
