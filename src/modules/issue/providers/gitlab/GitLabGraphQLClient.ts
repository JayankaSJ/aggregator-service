import { ApiClient } from "@/clients/ApiClient";

export interface GraphQLResponse<T> {
  data: T;
  errors?: any[];
}

export class GitLabGraphQLClient extends ApiClient {
  private _token: string;
  constructor(token: string) {
    super("https://gitlab.com/api/");
    this._token = token;
  }

  async graphQL<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const body = {
      query,
      variables,
    };

    try {
      const path = `/graphql?private_token=${this._token}`;
      const response = await this.post<GraphQLResponse<T>>(path, body);

      if (response.errors) {
        throw new Error(`GraphQL Errors: ${JSON.stringify(response.errors)}`);
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
