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

    if (!id && id !== 0) {
      throw new Error("Publication ID is required");
    }

    // Ensure ID is properly formatted
    const publicationId = String(id).trim();
    if (!publicationId) {
      throw new Error("Invalid publication ID");
    }

    try {
      const url = `${API_URL}/publications/${publicationId}`;
      console.log("Deleting publication:", { id: publicationId, url });
      
      const response = await axios.delete(url, {
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        }
      });
      return response.data;
    } catch (error: any) {
      console.error("Delete publication API error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Re-throw with more context
      if (error.response) {
        // Server responded with error status
        throw error;
      } else if (error.request) {
        // Request was made but no response received
        throw new Error("Network error: Could not reach the server");
      } else {
        // Something else happened
        throw new Error(error.message || "An unexpected error occurred");
      }
    }
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