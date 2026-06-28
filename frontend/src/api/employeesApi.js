import axiosClient from "./axiosClient";

export async function getEmployees() {
  const response = await axiosClient.get("/employees");

  return response.data.data;
}

export async function getEmployeeById(id) {
  const response = await axiosClient.get(`/employees/${id}`);

  return response.data.data;
}