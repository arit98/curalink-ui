export async function fetchAllPublications(): Promise<any[]> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const res = await fetch(`${baseUrl}/publications/`);
  if (!res.ok) {
    throw new Error(`Failed to fetch publications: HTTP ${res.status}`);
  }
  const data = await res.json();
  return data;
}


