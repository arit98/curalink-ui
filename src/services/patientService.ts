import axios from "axios";
import { authService } from "./authService";
import { getApiBaseUrl } from "@/lib/apiConfig";

const API_URL = getApiBaseUrl();

export const patientService = {
  async saveProfile(data: {
    condition: string;
    location?: string;
  }) {
    const token = authService.getToken();
    if (!token) throw new Error("User not authenticated");

    const res = await axios.post(`${API_URL}/onboarding/patient`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  },

  async updateProfile(data: {
    condition?: string;
    location?: string;
  }) {
    const token = authService.getToken();
    if (!token) throw new Error("User not authenticated");

    const res = await axios.put(`${API_URL}/onboarding/patient`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  },
};