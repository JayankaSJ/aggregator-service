import { Issue } from "../../models/Issue.model";

export function getAllIssuesQuery(namespace: string, project: string) {
  return `
    query {
      project(fullPath: "${namespace}/${project}") {
        issues {
          nodes {
            id
            iid
            title
            description
            state
            createdAt
            updatedAt
          }
        }
      }
    }
  `;
}

export function getIssueQuery(
  namespace: string,
  project: string,
  issueId: string
) {
  return `
      query {
        project(fullPath: "${namespace}/${project}") {
          issue(iid: "${issueId}") {
            id
            iid
            title
            description
            state
            createdAt
            updatedAt
          }
        }
      }
    `;
}

export function createIssueMutation(
  namespace: string,
  project: string,
  issue: Issue
) {
  return `
    mutation {
      createIssue(input: {
        projectPath: "${namespace}/${project}",
        title: "${issue.title}",
        description: "${issue.description}",
      }) {
        issue {
          id
          iid
          title
          description
          state
          createdAt
          updatedAt
        }
      }
    }
  `;
}

export function updateIssueMutation(
  namespace: string,
  project: string,
  issue: Issue
) {
  return `
    mutation {
      updateIssue(input: {
        projectPath: "${namespace}/${project}",
        iid: "${issue.id}",
        title: "${issue.title}",
        description: "${issue.description}",
      }) {
        issue {
          id
          iid
          title
          description
          state
          updatedAt
        }
      }
    }
  `;
}
