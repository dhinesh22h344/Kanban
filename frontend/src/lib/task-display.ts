import type { Priority, TaskStatus } from "@/types/api";

const CHIP_BASE =
  "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

export const statusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  TESTING: "Testing",
  COMPLETED: "Completed",
  BLOCKED: "Blocked",
};

// Jira-style status lozenge colors — reserved for state, always paired with the label above.
export const statusChipClassName: Record<TaskStatus, string> = {
  TODO: `${CHIP_BASE} bg-(--status-todo-bg) text-(--status-todo-fg)`,
  IN_PROGRESS: `${CHIP_BASE} bg-(--status-inprogress-bg) text-(--status-inprogress-fg)`,
  TESTING: `${CHIP_BASE} bg-(--status-testing-bg) text-(--status-testing-fg)`,
  COMPLETED: `${CHIP_BASE} bg-(--status-completed-bg) text-(--status-completed-fg)`,
  BLOCKED: `${CHIP_BASE} bg-(--status-blocked-bg) text-(--status-blocked-fg)`,
};

export const priorityLabels: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const priorityChipClassName: Record<Priority, string> = {
  LOW: `${CHIP_BASE} bg-(--priority-low-bg) text-(--priority-low-fg)`,
  MEDIUM: `${CHIP_BASE} bg-(--priority-medium-bg) text-(--priority-medium-fg)`,
  HIGH: `${CHIP_BASE} bg-(--priority-high-bg) text-(--priority-high-fg)`,
  CRITICAL: `${CHIP_BASE} bg-(--priority-critical-bg) text-(--priority-critical-fg)`,
};
