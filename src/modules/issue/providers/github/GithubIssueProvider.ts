import { inject, injectable } from "inversify";
import { CredentialsService } from "@/services/Credentials.service";
import { Parameters } from "@/types/Parameters";
import { GitHubGraphQLClient } from "./GitHubGraphQLClient";
import { Issue } from "../../models/Issue.model";
import { IIssueProvider } from "../../abstractions/IIssueProvider";
import { LoggerService } from "@/services/Logger.service";
import {
  getAllIssuesQuery,
  getIssueQuery,
  createIssueMutation,
  updateIssueMutation,
  deleteIssueMutation,
  getIssueIdByNumberQuery,
  getRepositoryIdQuery,
} from "./GithubQueries";
import { translateToIssue } from "./utils";

type GithubIssue = Issue & {
  body: string;
  number: number;
};

@injectable()
export class GithubIssueProvider implements IIssueProvider {
  private _cachedToken?: string;
  private _cachedClient?: GitHubGraphQLClient;

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
    const credentials = await this.credentialsService.get("github");
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
    const token = await this.getAuthToken();
    this.logger.debug("Creating new GitHubGraphQLClient instance");
    return new GitHubGraphQLClient(token);
  }

  async getAll(params: Parameters): Promise<Issue[]> {
    this.validateNamespaceAndRepository(params);
    const { namespace, repository, id } = params;

    const query = getAllIssuesQuery(namespace as string, repository as string);
    const client = await this.getClient();
    const response = await client.graphQL<{
      repository: { issues: { nodes: GithubIssue[] } };
    }>(query);

    response.repository.issues.nodes.forEach(translateToIssue);
    return response.repository.issues.nodes;
  }

  async getOne(params: Parameters): Promise<Issue> {
    this.validateNamespaceAndRepository(params);
    const { namespace, repository, id } = params;

    const idAsNumber = Number(id);
    if (isNaN(idAsNumber)) {
      this.logger.error("Failed to get issue ID from params");
      throw new Error("Issue ID must be a number");
    }

    const query = getIssueQuery(
      namespace as string,
      repository as string,
      idAsNumber
    );

    const client = await this.getClient();

    const response = await client.graphQL<{
      repository: { issue: GithubIssue };
    }>(query);

    return translateToIssue(response.repository.issue);
  }

  async create(params: Parameters): Promise<Issue> {
    this.validateNamespaceAndRepository(params);

    const issue = params.issue as Issue;
    this.validateIssue(issue);

    const repositoryId = await this.getRepositoryId(params);

    if (!repositoryId) {
      this.logger.error("Failed to retrive repository ID");
      throw new Error("Failed to retrive repository ID");
    }
    const query = createIssueMutation(repositoryId, issue);
    const client = await this.getClient();

    const response = await client.graphQL<{
      createIssue: { issue: GithubIssue };
    }>(query);

    return translateToIssue(response.createIssue.issue);
  }

  async update(params: Parameters): Promise<Issue> {
    this.validateNamespaceAndRepository(params);
    const { namespace, repository, id } = params;

    const issue = params.issue as Issue;
    this.validateIssue(issue);

    const issueNumber = params.id as string;
    if (!issueNumber) {
      this.logger.error("Issue ID is not provided");
      throw new Error("Issue ID is required");
    }

    const issueIdAsNumber = Number(issueNumber);
    if (isNaN(issueIdAsNumber)) {
      throw new Error("Issue ID must be a number");
    }
    const issueId = await this.getIssueIdByNumber({
      namespace,
      repository,
      id: issueNumber,
    });
    if (!issueId) {
      this.logger.error("Failed to retrieve issue ID");
      throw new Error("Failed to retrieve issue ID");
    }

    const query = updateIssueMutation(issueId, issue);
    const client = await this.getClient();

    const response = await client.graphQL<{
      updateIssue: { issue: GithubIssue };
    }>(query);

    return translateToIssue(response.updateIssue.issue);
  }

  async delete(params: Parameters): Promise<boolean> {
    this.validateNamespaceAndRepository(params);
    const { namespace, repository, id } = params;

    const issueNumber = params.id as string;
    if (!issueNumber) {
      this.logger.error("Issue ID is not provided");
      throw new Error("Issue ID is required");
    }

    const issueIdAsNumber = Number(issueNumber);
    if (isNaN(issueIdAsNumber)) {
      this.logger.error("Issue ID must be a number - not a string");
      throw new Error("Issue ID must be a number");
    }
    const issueId = await this.getIssueIdByNumber({
      namespace,
      repository,
      id: issueNumber,
    });

    if (!issueId) {
      this.logger.error("Failed to retrieve issue ID");
      throw new Error("Failed to retrieve issue ID");
    }

    const query = deleteIssueMutation(issueId);
    const client = await this.getClient();

    await client.graphQL<{
      deleteIssue: { clientMutationId: string };
    }>(query);
    return true;
  }

  private async getRepositoryId(params: Parameters): Promise<string> {
    this.validateNamespaceAndRepository(params);
    const { namespace, repository, id } = params;

    const query = getRepositoryIdQuery(
      namespace as string,
      repository as string
    );

    const client = await this.getClient();
    const response = await client.graphQL<{
      repository: { id: string };
    }>(query);

    return response.repository.id;
  }

  private async getIssueIdByNumber(params: Parameters): Promise<string> {
    this.validateNamespaceAndRepository(params);
    const { namespace, repository, id } = params;

    const issueIdAsNumber = Number(id);
    if (isNaN(issueIdAsNumber)) {
      this.logger.error("Issue ID must be a number - not a string");
      throw new Error("Issue ID must be a number");
    }

    const query = getIssueIdByNumberQuery(
      namespace as string,
      repository as string,
      issueIdAsNumber
    );

    const client = await this.getClient();
    const response = await client.graphQL<{
      repository: { issue: { id: string } };
    }>(query);

    return response.repository.issue.id;
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
