export function getApiBaseUrl(): string {
  const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
  if (isDev) return '/api/v1';
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  return envUrl || '/api/v1';
}