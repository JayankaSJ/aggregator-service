import { Parameters } from "@/types/Parameters";
import { Issue } from "../models/Issue.model";

export interface IIssueProvider {
  getAll: (params: Parameters) => Promise<Issue[]>;
  getOne: (params: Parameters) => Promise<Issue>;
  create: (params: Parameters) => Promise<Issue>;
  update: (params: Parameters) => Promise<Issue>;
  delete: (params: Parameters) => Promise<boolean>;
}
