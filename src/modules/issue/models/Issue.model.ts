import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class Issue {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  source!: string;

  @Field()
  createdAt!: string;
}
