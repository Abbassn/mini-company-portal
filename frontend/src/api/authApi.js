import axiosClient from "./axiosClient";

export async function loginUser(credentials) {
  const response = await axiosClient.post("/auth/login", credentials);

  return response.data.data;
}

export async function getCurrentUser() {
  const response = await axiosClient.get("/auth/me");

  return response.data.data;
}