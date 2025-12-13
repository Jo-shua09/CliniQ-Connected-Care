import { getAuthToken } from "./api";

const BASE_URL = "https://cliniq2.pythonanywhere.com";

export async function pullVitals() {
  try {
    const token = getAuthToken();
    const username = localStorage.getItem("cliniq_user") ? JSON.parse(localStorage.getItem("cliniq_user")!).username : "default_user";
    const url = new URL(`${BASE_URL}/get_vitals`);
    url.searchParams.append("username", username);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch vitals");
    }

    const data = await response.json();

    console.log("Fetched vitals:", data);

    // Map backend response to frontend expected structure
    return {
      spo2: data.blood_oxygen ?? 0,
      bpm: data.heart_rate ?? 0,
      temp: data.temp ?? 0,
      sbp: data.sbp ?? 0,
      dbp: data.dbp ?? 0,
      current_step_count: 0,
      alert: "",
      online: data.online ?? false,
      ecg_sensor_frame: data.ecg_sensor_frame ?? [],
      time_diff_seconds: data.time_diff_seconds ?? 0,
    };
  } catch (error) {
    console.error("Error fetching vitals:", error);
    return null;
  }
}
