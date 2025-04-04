import { inject, injectable } from "inversify";
import { CredentialsService } from "@/services/Credentials.service";
import { Parameters } from "@/types/Parameters";
import { ApiClient } from "@/clients/ApiClient";
import { GitLabGraphQLClient } from "./GitLabGraphQLClient";
import { Issue } from "../../models/Issue.model";
import { IIssueProvider } from "../../abstractions/IIssueProvider";
import { LoggerService } from "@/services/Logger.service";
import {
  getAllIssuesQuery,
  getIssueQuery,
  createIssueMutation,
  updateIssueMutation,
} from "./GitlabQueries";
import { translateToIssue } from "./utils";

type GitlabIssue = Issue & {
  iid: string;
};

@injectable()
export class GitlabIssueProvider implements IIssueProvider {
  private _cachedToken?: string;
  private _cachedClient?: GitLabGraphQLClient;

  constructor(
    @inject(CredentialsService) private credentialsService: CredentialsService,
    @inject(LoggerService) private logger: LoggerService
  ) {}

  private async getAuthToken(): Promise<string> {
    if (this._cachedToken) {
      this.logger.debug("Using cached token");
      return this._cachedToken;
    }
    this.logger.debug("Fetching token from credentials service");
    const credentials = await this.credentialsService.get("gitlab");
    if (!credentials || !credentials.token) {
      this.logger.error("No credentials found for GitLab");
      throw new Error("Credentials retriving error for GitLab");
    }
    this._cachedToken = credentials?.token;
    return credentials?.token as string;
  }

  private async getClient() {
    if (this._cachedClient) {
      this.logger.debug("Using cached client");
      return this._cachedClient;
    }
    this.logger.debug("Creating new GitLabGraphQLClient instance");
    const token = await this.getAuthToken();
    this._cachedClient = new GitLabGraphQLClient(token);
    return this._cachedClient;
  }

  async getAll(params: Parameters): Promise<Issue[]> {
    this.validateNamespaceAndRepository(params);
    const { namespace, repository } = params;
    const query = getAllIssuesQuery(namespace as string, repository as string);
    const client = await this.getClient();

    const response = await client.graphQL<{
      project: { issues: { nodes: GitlabIssue[] } };
    }>(query);

    console.log("Response from GitLab:", response);

    if (!response.project || !response.project.issues) {
      this.logger.warn("Issues not found in GitLab");
      return [];
    }

    response.project.issues.nodes.forEach(translateToIssue);

    return response.project.issues.nodes;
  }

  async getOne(params: Parameters): Promise<Issue> {
    this.validateNamespaceAndRepository(params);
    const { namespace, repository } = params;
    const { id } = params;
    if (!id) {
      this.logger.error("Issue ID is not provided");
      throw new Error("Issue ID is required");
    }
    const query = getIssueQuery(
      namespace as string,
      repository as string,
      id as string
    );

    const client = await this.getClient();
    const response = await client.graphQL<{
      project: { issue: GitlabIssue };
    }>(query);

    if (!response?.project?.issue) {
      this.logger.error("Issue not found in GitLab");
      throw new Error("Issue not found");
    }

    return translateToIssue(response?.project?.issue);
  }

  async create(params: Parameters): Promise<Issue> {
    this.validateNamespaceAndRepository(params);
    const { namespace, repository } = params;

    const issue = params.issue as Issue;
    this.validateIssue(issue);

    const mutation = createIssueMutation(
      namespace as string,
      repository as string,
      issue
    );

    const client = await this.getClient();
    const response = await client.graphQL<{
      createIssue: { issue: GitlabIssue };
    }>(mutation);

    return translateToIssue(response?.createIssue?.issue);
  }

  async update(params: Parameters): Promise<Issue> {
    this.validateNamespaceAndRepository(params);
    const { namespace, repository } = params;

    const issue = params.issue as Issue;
    this.validateIssue(issue);

    const issueId = params.id as string;
    if (!issueId) {
      this.logger.error("Issue ID is not provided");
      throw new Error("Issue ID is required");
    }
    issue.id = issueId;

    const mutation = updateIssueMutation(
      namespace as string,
      repository as string,
      issue as Issue
    );
    const client = await this.getClient();
    const response = await client.graphQL<{
      updateIssue: { issue: GitlabIssue };
    }>(mutation);

    return translateToIssue(response?.updateIssue?.issue);
  }

  async delete(params: Parameters): Promise<boolean> {
    this.validateNamespaceAndRepository(params);
    const { namespace, repository } = params;

    const token = await this.getAuthToken();

    const issueId = params.id as string;
    if (!issueId) {
      this.logger.error("Issue ID is not provided");
      throw new Error("Issue ID is required");
    }

    const headers = {
      "PRIVATE-TOKEN": token,
    };
    const restApiClient = new ApiClient("https://gitlab.com/api/v4/", headers);

    const projectId = `${namespace}/${repository}`;
    const url = `projects/${encodeURIComponent(projectId)}/issues/${issueId}`;

    await restApiClient.delete(url);
    return true;
  }

  private validateNamespaceAndRepository(params: Parameters) {
    const { namespace, repository } = params;
    if (!namespace) {
      this.logger.error("Failed to get namespace from params");
      throw new Error("Namespace is required");
    }
    if (!repository) {
      this.logger.error("Failed to get repository from params");
      throw new Error("Repository is required");
    }
  }

  private validateIssue(issue: Issue) {
    if (!issue) {
      this.logger.error("Issue data is not provided");
      throw new Error("Issue data is required");
    }
    if (!issue.title) {
      this.logger.error("Issue title is not provided");
      throw new Error("Issue title is required");
    }
    if (!issue.description) {
      this.logger.error("Issue description is not provided");
      throw new Error("Issue description is required");
    }
  }
}
