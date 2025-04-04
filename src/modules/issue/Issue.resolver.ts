import { Resolver, Query, Arg, Mutation } from "type-graphql";
import { inject } from "inversify";
import { Issue } from "./models/Issue.model";
import { CreateIssue } from "./models/CreateIssue.model";
import { UpdateIssue } from "./models/UpdateIssue.model";
import { ServiceSelector } from "./IssueProvider.selector";

@Resolver()
export class IssueResolver {
  constructor(
    @inject(ServiceSelector) private serviceSelector: ServiceSelector
  ) {}

  @Query(() => [Issue])
  async issues(
    @Arg("namespace", {
      nullable: false,
      description:
        "The platform or entity hosting the repository. For GitHub, this is the 'owner' (could be a user or an organization). For GitLab, this is the 'namespace' (could be a user or a group). If not specified, defaults to 'gitlab'.",
    })
    namespace: string,
    @Arg("repository", {
      nullable: false,
      description:
        "The repository identifier, consisting of two parts: the first part is the owner or namespace (e.g., 'username' or 'groupname') and the second part is the repository name. For GitHub, this is in the format 'owner/repository'. For GitLab, it is in the format 'namespace/project'.",
    })
    repository: string,
    @Arg("source", {
      nullable: true,
      description:
        "The source where the issues will be fetched from (GitHub or GitLab).",
    })
    source?: string
  ): Promise<Issue[]> {
    const parameters = {
      namespace,
      repository,
      source,
    };
    return await this.serviceSelector.getAll(parameters);
  }

  @Query(() => Issue)
  async issue(
    @Arg("namespace", {
      nullable: false,
      description:
        "The platform or entity hosting the repository. For GitHub, this is the 'owner' (could be a user or an organization). For GitLab, this is the 'namespace' (could be a user or a group). If not specified, defaults to 'gitlab'.",
    })
    namespace: string,
    @Arg("repository", {
      nullable: false,
      description:
        "The repository identifier, consisting of two parts: the first part is the owner or namespace (e.g., 'username' or 'groupname') and the second part is the repository name. For GitHub, this is in the format 'owner/repository'. For GitLab, it is in the format 'namespace/project'.",
    })
    repository: string,
    @Arg("source", {
      nullable: true,
      description:
        "The source where the issues will be fetched from (GitHub or GitLab).",
    })
    source: string,
    @Arg("id") id: string
  ): Promise<Issue> {
    const parameters = {
      namespace,
      repository,
      source,
      id,
    };
    return await this.serviceSelector.getOne(parameters);
  }

  @Mutation(() => Issue)
  async create(
    @Arg("namespace", {
      nullable: false,
      description:
        "The platform or entity hosting the repository. For GitHub, this is the 'owner' (could be a user or an organization). For GitLab, this is the 'namespace' (could be a user or a group). If not specified, defaults to 'gitlab'.",
    })
    namespace: string,
    @Arg("repository", {
      nullable: false,
      description:
        "The repository identifier, consisting of two parts: the first part is the owner or namespace (e.g., 'username' or 'groupname') and the second part is the repository name. For GitHub, this is in the format 'owner/repository'. For GitLab, it is in the format 'namespace/project'.",
    })
    repository: string,
    @Arg("source", {
      nullable: true,
      description:
        "The source where the issues will be fetched from (GitHub or GitLab).",
    })
    source: string,
    @Arg("input") issue: CreateIssue
  ): Promise<Issue> {
    const parameters = {
      namespace,
      repository,
      source,
      issue,
    };
    return await this.serviceSelector.create(parameters);
  }

  @Mutation(() => Issue)
  async update(
    @Arg("namespace", {
      nullable: false,
      description:
        "The platform or entity hosting the repository. For GitHub, this is the 'owner' (could be a user or an organization). For GitLab, this is the 'namespace' (could be a user or a group). If not specified, defaults to 'gitlab'.",
    })
    namespace: string,
    @Arg("repository", {
      nullable: false,
      description:
        "The repository identifier, consisting of two parts: the first part is the owner or namespace (e.g., 'username' or 'groupname') and the second part is the repository name. For GitHub, this is in the format 'owner/repository'. For GitLab, it is in the format 'namespace/project'.",
    })
    repository: string,
    @Arg("source", {
      nullable: true,
      description:
        "The source where the issues will be fetched from (GitHub or GitLab).",
    })
    source: string,
    @Arg("id") id: string,
    @Arg("input") issue: UpdateIssue
  ): Promise<Issue> {
    const parameters = {
      namespace,
      repository,
      source,
      id,
      issue,
    };
    return await this.serviceSelector.update(parameters);
  }

  @Mutation(() => Boolean)
  async delete(
    @Arg("namespace", {
      nullable: false,
      description:
        "The platform or entity hosting the repository. For GitHub, this is the 'owner' (could be a user or an organization). For GitLab, this is the 'namespace' (could be a user or a group). If not specified, defaults to 'gitlab'.",
    })
    namespace: string,
    @Arg("repository", {
      nullable: false,
      description:
        "The repository identifier, consisting of two parts: the first part is the owner or namespace (e.g., 'username' or 'groupname') and the second part is the repository name. For GitHub, this is in the format 'owner/repository'. For GitLab, it is in the format 'namespace/project'.",
    })
    repository: string,
    @Arg("source", {
      nullable: true,
      description:
        "The source where the issues will be fetched from (GitHub or GitLab).",
    })
    source: string,
    @Arg("id") id: string
  ): Promise<boolean> {
    const parameters = {
      namespace,
      repository,
      source,
      id,
    };
    return await this.serviceSelector.delete(parameters);
  }
}
