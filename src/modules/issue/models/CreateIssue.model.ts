import { Field, InputType } from "type-graphql";

@InputType()
export class CreateIssue {
  @Field()
  title!: string;

  @Field()
  description!: string;
}
