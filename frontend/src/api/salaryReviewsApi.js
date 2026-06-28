import axiosClient from "./axiosClient";

export async function getSalaryReviews() {
  const response = await axiosClient.get("/salary-reviews");

  return response.data.data;
}

export async function getMySalaryReviews() {
  const response = await axiosClient.get("/salary-reviews/me");

  return response.data.data;
}

export async function createSalaryReview(reviewData) {
  const response = await axiosClient.post("/salary-reviews", reviewData);

  return response.data.data;
}

export async function approveSalaryReview(id) {
  const response = await axiosClient.patch(`/salary-reviews/${id}/approve`);

  return response.data.data;
}

export async function rejectSalaryReview(id) {
  const response = await axiosClient.patch(`/salary-reviews/${id}/reject`);

  return response.data.data;
}
