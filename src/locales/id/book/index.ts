import bookDetail from "./book-detail"
import bookInfo from "./book-info"
import book from "./book"

const obj = {
    ...book,
    info: bookInfo,
    detail: bookDetail,
}

export default obj