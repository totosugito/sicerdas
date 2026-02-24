import createTier from "./create-tier";
import listTier from "./list-tier";
import tier from "./tier";
const obj = {
    ...tier,
    list: listTier,
    create: createTier,
}
export default obj
