import exam from "./exam";
import packages from "./packages";
import subjects from "./subject";
import sections from "./sections";
import passages from "./passages";
import questions from "./question";

const obj = {
    ...exam,
    subjects,
    packages,
    sections,
    passages,
    questions
}
export default obj
