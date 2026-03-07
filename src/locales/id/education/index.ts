import education from "./education";
import gradeList from "./grade/grade-list";
import categories from "./categories/list-category";
import tags from "./tags/list-tags";

const obj = {
    ...education,
    grade: gradeList,
    categories: categories,
    tags: {
        list: tags
    },
}

export default obj