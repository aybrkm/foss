export type ProjectStage = "idea" | "active" | "follow_up" | "archive";
export type ProjectStatus = "on_track" | "at_risk" | "blocked";

export interface ProjectItem {
  id: string;
  name: string;
  owner: string;
  stage: ProjectStage;
  status: ProjectStatus;
  progress: number;
  summary: string;
  focus: string[];
  tags: string[];
  startDate: string;
  dueDate: string;
  budgetUsedPercentage: number;
  nextStep: string;
}

export type CurrentWorkStatus = "planned" | "in-progress" | "review" | "blocked" | "done";
export type CurrentWorkPriority = "low" | "medium" | "high" | "asap";

export interface CurrentWorkItem {
  id: string;
  title: string;
  project: string;
  owner: string;
  status: CurrentWorkStatus;
  priority: CurrentWorkPriority;
  dueDate: string;
  effort: string;
  description: string;
}

export interface TimelineItem {
  id: string;
  project: string;
  label: string;
  dueDate: string;
  status: "planned" | "due-soon" | "completed";
  confidence: "high" | "medium" | "low";
}

export interface FollowUpItem {
  id: string;
  project: string;
  owner: string;
  type: "approval" | "risk" | "handoff";
  dueDate: string;
  notes: string;
  severity: "low" | "medium" | "high";
}

export interface CapacityItem {
  id: string;
  team: string;
  lead: string;
  loadPercentage: number;
  limitPercentage: number;
  focus: string[];
}
