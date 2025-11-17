import axios from "axios";
import { getApiBaseUrl } from "./apiConfig";

const API_URL = getApiBaseUrl();
const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

export const recommendTrials = async () => {
    const response = await axios.get(`${API_URL}/api/v1/onboarding/patient/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });
    return response.data;

    if(response.data.condition?.toLowerCase().includes("cancer")) {
        return "cancer";
    } else if(response.data.condition?.toLowerCase().includes("heart")) {
        return "heart";
    } else if(response.data.condition?.toLowerCase().includes("diabetes")) {
        return "diabetes";
    } else if(response.data.condition?.toLowerCase().includes("alzheimer")) {
        return "alzheimer";
    } else if(response.data.condition?.toLowerCase().includes("parkinson")) {
        return "parkinson";
    } else if(response.data.condition?.toLowerCase().includes("kidney")) {
        return "kidney";
    } else if(response.data.condition?.toLowerCase().includes("liver")) {
        return "liver";
    } else {
        return [];
    }
}