import { InputType, Field } from "type-graphql";

@InputType()
export class UpdateIssue {
  @Field()
  title!: string;

  @Field()
  description!: string;
}
