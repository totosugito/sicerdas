import education from "./education";
import gradeList from "./grade/grade-list";
import categories from "./categories/list-category";

const obj = {
    ...education,
    grade: gradeList,
    categories: categories
}

export default obj