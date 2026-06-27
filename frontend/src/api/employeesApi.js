import axiosClient from "./axiosClient";

export async function getEmployees() {
  const response = await axiosClient.get("/employees");

  return response.data.data;
}