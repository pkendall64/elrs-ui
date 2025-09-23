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
  IS_TX: toBool(import.meta.env.VITE_FEATURE_IS_TX, false),
  IS_8285: toBool(import.meta.env.VITE_FEATURE_IS_8285, false),
  HAS_SX128X: toBool(import.meta.env.VITE_FEATURE_HAS_SX128X, false),
  HAS_SX127X: toBool(import.meta.env.VITE_FEATURE_HAS_SX127X, false),
  HAS_LR1121: toBool(import.meta.env.VITE_FEATURE_HAS_LR1121, false),
  HAS_SUBGHZ: toBool(import.meta.env.VITE_FEATURE_HAS_SUBGHZ, false),
};

export default FEATURES;
