
export * from './Background';
export * from './CustomDropdown';
export * from './GlassCard';
export * from './InfoIcon';
export * from './LoadingScreen';
// Fixed: Export StarRating as a named export from the component file directly because index.ts is missing in the subfolder
export { default as StarRating } from './StarRating/starRating';
