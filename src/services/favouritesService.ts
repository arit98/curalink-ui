import axios from 'axios';
import { getApiBaseUrl } from '@/lib/apiConfig';

export async function fetchFavorites(): Promise<any> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/favourites`;

  console.log("URL ",url);
  
  const response = await axios.get(url);
  return response.data;
}


