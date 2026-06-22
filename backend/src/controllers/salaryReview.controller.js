import {
  getSalaryReviewsService,
  createSalaryReviewService,
  getMySalaryReviewsService,
  approveSalaryReviewService,
  rejectSalaryReviewService,
} from "../services/salaryReview.service.js";

import { validateCreateSalaryReview } from "../validators/salaryReview.validator.js";

export async function getSalaryReviews(req, res) {
  try {
    const reviews = await getSalaryReviewsService(req.user);

    return res.status(200).json({
      message: "Salary reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    console.error("Get salary reviews error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
    });
  }
}

export async function createSalaryReview(req, res) {
  try {
    const errors = validateCreateSalaryReview(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    const review = await createSalaryReviewService(req.body, req.user);

    return res.status(201).json({
      message: "Salary review created successfully",
      data: review,
    });
  } catch (error) {
    console.error("Create salary review error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
    });
  }
}

export async function getMySalaryReviews(req, res) {
  try {
    const reviews = await getMySalaryReviewsService(req.user);

    return res.status(200).json({
      message: "My salary reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    console.error("Get my salary reviews error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
    });
  }
}

export async function approveSalaryReview(req, res) {
  try {
    const review = await approveSalaryReviewService(req.params.id, req.user);

    return res.status(200).json({
      message: "Salary review approved successfully",
      data: review,
    });
  } catch (error) {
    console.error("Approve salary review error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
    });
  }
}

export async function rejectSalaryReview(req, res) {
  try {
    const review = await rejectSalaryReviewService(req.params.id, req.user);

    return res.status(200).json({
      message: "Salary review rejected successfully",
      data: review,
    });
  } catch (error) {
    console.error("Reject salary review error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
    });
  }
}