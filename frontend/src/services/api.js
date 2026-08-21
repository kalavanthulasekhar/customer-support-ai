import axios from "axios";
import API_BASE_URL from "../config/api";

const API_URL = `${API_BASE_URL}/chat/`;

export const sendMessage = async (message) => {
  try {
    const response = await axios.post(API_URL, {
      message: message
    });

    return response.data;

  } catch (error) {
    console.error(error);

    return {
      intent: "error",
      agent: "error",
      response: "Backend connection failed."
    };
  }
};