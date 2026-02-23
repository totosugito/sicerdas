import categories from "./categories/categories";
import exam from "./exam";
const obj = {
    ...exam.exam,
    categories: {
        categories: categories
    },
}
export default obj
