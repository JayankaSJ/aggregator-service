import { Issue } from "../../models/Issue.model";

export function translateToIssue(issue: any): Issue {
  if (!issue) {
    return undefined as unknown as Issue;
  }
  issue.id = issue.iid as string;
  issue.source = "gitlab";
  return issue;
}
