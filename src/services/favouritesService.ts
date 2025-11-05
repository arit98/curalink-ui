export async function fetchFavorites(): Promise<any> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const url = `${baseUrl}/favourites`;

  console.log("URL ",url);
  

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch favourites: HTTP ${res.status}`);
  }

  const data = await res.json();
  return data;
}


