import axios from "axios";
import { getApiBaseUrl } from "@/lib/apiConfig";
import { authService } from "./authService";

const API_URL = getApiBaseUrl();

export const publicationService = {
  async fetchAllPublications(): Promise<any[]> {
    const baseUrl = getApiBaseUrl();
    const response = await axios.get(`${baseUrl}/publications/`);
    return response.data;
  },

  async createPublication(payload: any): Promise<any> {
    const token = authService.getToken();
    if (!token) throw new Error("User not authenticated");

    const response = await axios.post(`${API_URL}/publications/`, payload, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async deletePublication(id: string | number): Promise<any> {
    const token = authService.getToken();
    if (!token) throw new Error("User not authenticated");

    const response = await axios.delete(`${API_URL}/publications/${id}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async updatePublication(id: string | number, payload: any): Promise<any> {
    const token = authService.getToken();
    if (!token) throw new Error("User not authenticated");

    const response = await axios.put(`${API_URL}/publications/${id}`, payload, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
};