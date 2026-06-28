import axiosClient from "./axiosClient";

export async function getEmployees() {
  const response = await axiosClient.get("/employees");

  return response.data.data;
}

export async function getEmployeeById(id) {
  const response = await axiosClient.get(`/employees/${id}`);

  return response.data.data;
}

export async function createEmployee(employeeData) {
  const response = await axiosClient.post("/employees", employeeData);

  return response.data.data;
}

export async function updateEmployee(id, employeeData) {
  const response = await axiosClient.patch(`/employees/${id}`, employeeData);

  return response.data.data;
}
