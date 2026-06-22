import {
  getEmployeesService,
  getEmployeeByIdService,
  createEmployeeService,
  getMyEmployeeProfileService,
  
} from "../services/employee.service.js";

import { validateCreateEmployee } from "../validators/employee.validator.js";

export async function getEmployees(req, res) {
  try {
    const employees = await getEmployeesService(req.user);

    return res.status(200).json({
      message: "Employees fetched successfully",
      data: employees,
    });
  } catch (error) {
    console.error("Get employees error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
    });
  }
}

export async function getEmployeeById(req, res) {
  try {
    const employee = await getEmployeeByIdService(req.params.id, req.user);

    return res.status(200).json({
      message: "Employee fetched successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Get employee by id error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
    });
  }
}

export async function createEmployee(req, res) {
  try {
    const errors = validateCreateEmployee(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    const employee = await createEmployeeService(req.body, req.user);

    return res.status(201).json({
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Create employee error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
    });
  }
}

export async function getMyEmployeeProfile(req, res) {
  try {
    const employee = await getMyEmployeeProfileService(req.user);

    return res.status(200).json({
      message: "Employee profile fetched successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Get my employee profile error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
    });
  }
}