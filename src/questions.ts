import type {
  Answers,
  AsyncDynamicQuestionProperty,
  ChoiceCollection,
  DistinctChoice,
  QuestionCollection,
} from "inquirer";
import { checkFileExist } from "./helper.js";

export const file = (): QuestionCollection<{ file: string }> => ({
  type: "input",
  name: "file",
  message: "Select a file containing invitees:",
  validate: (input: string) => {
    try {
      return !!checkFileExist(input);
    } catch {
      return "Please enter a valid filename";
    }
  },
});

export const token = (
  auth?: string,
): QuestionCollection<{ token: string }> => ({
  type: "password",
  name: "token",
  message: "GitHub Token:",
  mask: "*",
  default: auth,
  validate: (input: string) => !!input.trim() || "Please enter a valid token",
  when: !auth,
});

export const org = (
  choices: ChoiceCollection,
): QuestionCollection<{ org: string }> => ({
  type: "list",
  name: "org",
  message: "Select an organization to invite users to:",
  choices,
});

export const teamIds = (
  choices: AsyncDynamicQuestionProperty<ReadonlyArray<DistinctChoice<Answers>>>,
): QuestionCollection<{
  shouldInviteWithTeams: boolean;
  teamIds?: number[];
}> => [
  {
    type: "confirm",
    name: "shouldInviteWithTeams",
    message: "Invite with teams?:",
    default: false,
  },
  {
    type: "checkbox",
    name: "teamIds",
    message: "Select teams:",
    choices,
    when: ({ shouldInviteWithTeams }) => shouldInviteWithTeams,
  },
];

export default {
  file,
  token,
  org,
  teamIds,
};
