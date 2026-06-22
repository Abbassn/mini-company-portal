export function calculateSalary(employee) {
  const baseSalary = Number(employee.base_salary);
  const marketMidpoint = Number(employee.market_midpoint);
  const workingDays = Number(employee.working_days);
  const absentDays = Number(employee.absent_days);

  const compaRatio = (baseSalary / marketMidpoint) * 100;
  const dailySalary = baseSalary / workingDays;
  const deduction = dailySalary * absentDays;
  const finalSalary = baseSalary - deduction;

  return {
    compaRatio: Number(compaRatio.toFixed(2)),
    dailySalary: Number(dailySalary.toFixed(2)),
    deduction: Number(deduction.toFixed(2)),
    finalSalary: Number(finalSalary.toFixed(2)),
  };
}

export function attachSalaryCalculation(employee) {
  return {
    ...employee,
    salary_calculation: calculateSalary(employee),
  };
}