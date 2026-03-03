import list from "./categories/list-category";
import exam from "./exam";
import tags from "./tags/list-tags";
import packages from "./packages/list-package";
import subjects from "./subjects/list-subject";
const obj = {
    ...exam,
    subjects: {
        list: subjects
    },
    packages: {
        list: packages
    },
    tags: {
        list: tags
    },
    categories: {
        list: list
    },
}
export default obj
