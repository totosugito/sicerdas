import exam from "./exam";
import packages from "./packages/list-package";
import { detailPackage } from "./packages/detail-package";
import subjects from "./subjects/list-subject";
import packageSection from "./package-section/list-section";
import passageList from "./passages/passage-list";
import questions from "./questions/list-question";

const obj = {
    ...exam,
    subjects: {
        list: subjects
    },
    packages: {
        list: packages,
        detail: detailPackage
    },
    packageSection: {
        list: packageSection
    },
    passages: {
        list: passageList
    },
    questions: {
        list: questions
    }
}
export default obj
