import { Issue } from "../../models/Issue.model";

const LIST_LIMIT = 10;

export function getRepositoryIdQuery(owner: string, repository: string) {
  return `
    query {
      repository(owner: "${owner}", name: "${repository}") {
        id
      }
    }
  `;
}

export function getIssueIdByNumberQuery(
  owner: string,
  repository: string,
  issueNumber: number
) {
  return `
    query {
      repository(owner: "${owner}", name: "${repository}") {
        issue(number: ${issueNumber}) {
          id
        }
      }
    }
  `;
}

export function getAllIssuesQuery(owner: string, repository: string) {
  return `
    query {
      repository(owner: "${owner}", name: "${repository}") {
        issues(first: ${LIST_LIMIT}) {
          nodes {
            id
            number,
            title
            body
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
  repository: string,
  id: number
) {
  return `
    query {
      repository(owner: "${namespace}", name: "${repository}") {
        issue(number: ${id}) {
          id
          number,
          title
          body
          state
          createdAt
          updatedAt
        }
      }
    }
  `;
}

export function createIssueMutation(repository: string, issue: Issue) {
  return `
    mutation {
      createIssue(input: {
        repositoryId: "${repository}", 
        title: "${issue.title}", 
        body: "${issue.description}",
      }) {
        issue {
          id
          number,
          title
          body
          state
          createdAt
          updatedAt
        }
      }
    }
  `;
}

export function updateIssueMutation(issueId: string, issue: Issue) {
  return `
    mutation {
      updateIssue(input: {
        id: "${issueId}",
        title: "${issue.title}",
        body: "${issue.description}",
      }) {
        issue {
          id
          number
          title
          body
          state
          createdAt
          updatedAt
        }
      }
    }
  `;
}

export function deleteIssueMutation(issueId: string) {
  return `
    mutation {
      deleteIssue(input: {
        issueId: "${issueId}"
      }) {
        clientMutationId
      }
    }
  `;
}
