import { Container } from "inversify";
import { CredentialsService } from "@/services/Credentials.service";
import { GithubIssueProvider } from "@/modules/issue/providers/github/GithubIssueProvider";
import { GitlabIssueProvider } from "@/modules/issue/providers/gitlab/GitlabIssueProvider";
import { IssueResolver } from "@/modules/issue/Issue.resolver";
import { ServiceSelector } from "@/modules/issue/IssueProvider.selector";
import { LoggerService } from "@/services/Logger.service";

const container = new Container();

container.bind(LoggerService).toSelf();
container.bind(CredentialsService).toSelf();

container
  .bind<GithubIssueProvider>("GithubIssueProvider")
  .to(GithubIssueProvider);
container
  .bind<GitlabIssueProvider>("GitlabIssueProvider")
  .to(GitlabIssueProvider);

container.bind(IssueResolver).toSelf();

container.bind(ServiceSelector).toSelf();

export { container };
