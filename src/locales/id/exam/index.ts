import exam from "./exam";
import packages from "./packages";
import subjects from "./subject";
import sections from "./sections";
import passages from "./passages";
import questions from "./question";
import options from "./options";
import solutions from "./solutions";
import tags from "./tags";
import packageQuestions from "./package-questions";
import sessions from "./sessions";

const obj = {
  ...exam,
  subjects,
  packages,
  sections,
  passages,
  questions,
  options,
  solutions,
  tags,
  packageQuestions,
  sessions,
};
export default obj;
