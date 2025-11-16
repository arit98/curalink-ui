import axios from 'axios';
import { getApiBaseUrl } from '@/lib/apiConfig';

export async function fetchExperts(): Promise<any[]> {
    const baseUrl = getApiBaseUrl();
    const response = await axios.get(`${baseUrl}/experts`);
    return response.data;
  }
  
  