import { Issue } from "../../models/Issue.model";

export function translateToIssue(issue: any): Issue {
  if (!issue) {
    return undefined as unknown as Issue;
  }
  issue.description = issue.body as string;
  issue.id = `${issue.number}`;
  issue.source = "github";
  return issue;
}
