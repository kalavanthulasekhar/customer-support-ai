import axios from "axios";

const API_URL = "http://127.0.0.1:8000/chat/";

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