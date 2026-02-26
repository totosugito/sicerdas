import list from "./categories/list-category";
import exam from "./exam";
import tags from "./tags/list-tags";
import packages from "./packages/list-package";
const obj = {
    ...exam,
    categories: {
        list: list
    },
    tags: {
        list: tags
    },
    packages: {
        list: packages
    }
}
export default obj
