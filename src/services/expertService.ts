export async function fetchExperts(): Promise<any[]> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const res = await fetch(`${baseUrl}/experts`);
    if (!res.ok) {
      throw new Error(`Failed to fetch trials: HTTP ${res.status}`);
    }
    const data = await res.json();
    return data;
  }
  
  