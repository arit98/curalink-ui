import axios from "axios";
import { getApiBaseUrl } from "@/lib/apiConfig";
import { authService } from "./authService";

const API_URL = getApiBaseUrl();

export const trialService = {
  async fetchTrials(): Promise<any[]> {
    const response = await axios.get(`${API_URL}/trials`);
    return response.data;
  },

  async createTrial(payload: any): Promise<any> {
    const token = authService.getToken();
    if (!token) throw new Error("User not authenticated");

    const response = await axios.post(`${API_URL}/trials/`, payload, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    console.log(`url : ${API_URL}/trials/`);
    return response.data;
  },

  async deleteTrial(id: string | number): Promise<any> {
    const token = authService.getToken();
    if (!token) throw new Error("User not authenticated");

    const response = await axios.delete(`${API_URL}/trials/${id}`, { 
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } 
    });
    return response.data;
  },

  async updateTrial(id: string | number, payload: any): Promise<any> {
    const token = authService.getToken();
    if (!token) throw new Error("User not authenticated");

    const response = await axios.put(`${API_URL}/trials/${id}`, payload, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
};