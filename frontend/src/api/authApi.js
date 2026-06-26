import axiosClient from "./axiosClient";

export async function loginUser(credentials) {
  const response = await axiosClient.post("/auth/login", credentials);

  return response.data.data;
}