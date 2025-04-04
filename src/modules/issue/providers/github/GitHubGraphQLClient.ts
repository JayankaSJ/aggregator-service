import { ApiClient } from "@/clients/ApiClient";

export interface GraphQLResponse<T> {
  data: T;
  errors?: any[];
}

export class GitHubGraphQLClient extends ApiClient {
  constructor(token: string) {
    super("https://api.github.com/", {
      Authorization: `Bearer ${token}`,
    });
  }

  async graphQL<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const body = {
      query,
      variables,
    };

    try {
      const response = await this.post<GraphQLResponse<T>>("/graphql", body);

      if (response.errors) {
        throw new Error(`GraphQL Errors: ${JSON.stringify(response.errors)}`);
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
