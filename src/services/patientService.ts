import axios from "axios";
import { authService } from "./authService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

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
};