import { ApolloServer } from "apollo-server";
import { buildSchema, ContainerType } from "type-graphql";
import { container } from "@/config/container.config";
import { IssueResolver } from "@/modules/issue/Issue.resolver";

async function bootstrap() {
  const schema = await buildSchema({
    resolvers: [IssueResolver],
    container: container as ContainerType,
  });

  const server = new ApolloServer({
    schema,
  });

  server.listen(4000).then(({ url }) => {
    console.log(`Server ready at ${url}`);
  });
}

bootstrap();
