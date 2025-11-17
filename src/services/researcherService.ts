import axios from "axios";
import { authService } from "./authService";
import { getApiBaseUrl } from "@/lib/apiConfig";

const API_URL = getApiBaseUrl();

export const researcherService = {
  async saveProfile(data: {
    condition: string;
    location?: string;
    tags?: string[];
  }) {
    const token = authService.getToken();
    if (!token) throw new Error("User not authenticated");

    const res = await axios.post(`${API_URL}/onboarding/researcher`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  },

  async fetchPatientsInterested(): Promise<any[]> {
    const token = authService.getToken();
    if (!token) throw new Error("User not authenticated");

    try {
      // Fetch all users and filter for patients (role=0)
      const res = await axios.get(`${API_URL}/auth/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Filter for patients (role === 0)
      const patients = Array.isArray(res.data) 
        ? res.data.filter((user: any) => user.role === 0)
        : [];
      
      return patients;
    } catch (error: any) {
      console.error("Error fetching patients:", error);
      throw new Error(error.response?.data?.detail || "Failed to fetch patients");
    }
  },

  async updateProfile(data: {
    condition?: string;
    location?: string;
    tags?: string[];
  }) {
    const token = authService.getToken();
    if (!token) throw new Error("User not authenticated");

    const res = await axios.put(`${API_URL}/onboarding/researcher`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  },
};
