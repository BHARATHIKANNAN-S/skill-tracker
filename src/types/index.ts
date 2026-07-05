export type Role = "STUDENT" | "ADMIN" | "SUPER_ADMIN";

export function toRole(role: string): Role {
  if (role === "ADMIN" || role === "SUPER_ADMIN") return role;
  return "STUDENT";
}

export type LearningStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "EXPERT";
export type ProjectStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "DEPLOYED";
export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";
