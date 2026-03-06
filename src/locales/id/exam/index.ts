import exam from "./exam";
import tags from "./tags/list-tags";
import packages from "./packages/list-package";
import { detailPackage } from "./packages/detail-package";
import subjects from "./subjects/list-subject";
import packageSection from "./package-section/list-section";
const obj = {
    ...exam,
    subjects: {
        list: subjects
    },
    packages: {
        list: packages,
        detail: detailPackage
    },
    tags: {
        list: tags
    },
    packageSection: {
        list: packageSection
    }
}
export default obj
