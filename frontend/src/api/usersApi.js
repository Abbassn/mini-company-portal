import axiosClient from "./axiosClient";

export async function createUser(userData) {
  const response = await axiosClient.post("/users", userData);

  return response.data.data;
}
