import list from "./categories/list-category";
import exam from "./exam";
const obj = {
    ...exam,
    categories: {
        list: list
    },
}
export default obj
