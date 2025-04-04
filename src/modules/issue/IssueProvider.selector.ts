import { injectable, inject } from "inversify";
import { Parameters } from "@/types/Parameters";
import { Issue } from "./models/Issue.model";
import { IIssueProvider } from "./abstractions/IIssueProvider";
import { LoggerService } from "@/services/Logger.service";

@injectable()
export class ServiceSelector implements IIssueProvider {
  constructor(
    @inject("GithubIssueProvider") private githubIssueProvider: IIssueProvider,
    @inject("GitlabIssueProvider") private gitlabIssueProvider: IIssueProvider,
    @inject(LoggerService) private logger: LoggerService
  ) {}

  getSource(parameters: Parameters): string | undefined {
    return parameters.source as string;
  }

  getResolveProvider(source?: string): IIssueProvider {
    this.logger.info(`Resolving provider for source: ${source}`);
    if (source === "github") {
      return this.githubIssueProvider;
    } else if (source === "gitlab") {
      return this.gitlabIssueProvider;
    }
    throw new Error(
      `Invalid source: ${source}. Expected 'github' or 'gitlab'.`
    );
  }

  async getAll(parameters: Parameters): Promise<Issue[]> {
    const source = this.getSource(parameters);
    if (!source) {
      this.logger.info("Fetching issues from all providers.");
      let results: Issue[] = [];
      try {
        const promises = [
          this.githubIssueProvider,
          this.gitlabIssueProvider,
        ].map((provider) =>
          provider.getAll(parameters).then(
            (result) => ({ status: "fulfilled", value: result }),
            (error) => ({ status: "rejected", value: [], reason: error })
          )
        );

        const allResults = await Promise.all(promises);

        results = allResults
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value as Issue[])
          .flat();
      } catch (error) {
        this.logger.error("Error fetching issues from providers:", error);
      }
      return results;
    }
    const issueProvider = this.getResolveProvider(source);
    return issueProvider.getAll(parameters);
  }
  async getOne(parameters: Parameters): Promise<Issue> {
    const source = this.getSource(parameters);
    const issueProvider = this.getResolveProvider(source);
    return issueProvider.getOne(parameters);
  }
  async create(parameters: Parameters): Promise<Issue> {
    const source = this.getSource(parameters);
    const issueProvider = this.getResolveProvider(source);
    return issueProvider.create(parameters);
  }
  async update(parameters: Parameters): Promise<Issue> {
    const source = this.getSource(parameters);
    const issueProvider = this.getResolveProvider(source);
    return issueProvider.update(parameters);
  }
  async delete(parameters: Parameters): Promise<boolean> {
    const source = this.getSource(parameters);
    const issueProvider = this.getResolveProvider(source);
    return issueProvider.delete(parameters);
  }
}
