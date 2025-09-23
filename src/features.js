// Central place to read build-time feature flags from Vite env
// Any variable starting with VITE_ can be injected at build-time via .env files or CLI.
// Provide stable booleans for use in the app.

// Helper to coerce env strings to boolean
const toBool = (v, defaultValue) => {
  if (v === undefined || v === null || v === '') return defaultValue;
  if (typeof v === 'boolean') return v;
  const s = String(v).toLowerCase().trim();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on' || s === 'y';
};

export const FEATURES = {
  SHOW_LOGOS: toBool(import.meta.env.VITE_FEATURE_SHOW_LOGOS, false),
  ENABLE_COUNTER: toBool(import.meta.env.VITE_FEATURE_ENABLE_COUNTER, false),
  IS_TX: toBool(import.meta.env.VITE_FEATURE_IS_TX, false),
  IS_8285: toBool(import.meta.env.VITE_FEATURE_IS_8285, false),
};

export default FEATURES;
