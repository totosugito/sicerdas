import { pgEnum } from "drizzle-orm/pg-core";

export const EnumPeriodicGroup = {
    headerEmpty: 'headerEmpty',
    header: 'header',
    empty: 'empty',
    othernonmetals: 'othernonmetals',
    noble_gases: 'noble_gases',
    halogens: 'halogens',
    metalloids: 'metalloids',
    post_transition_metals: 'post_transition_metals',
    transition_metals: 'transition_metals',
    lanthanoids: 'lanthanoids',
    actinoids: 'actinoids',
    alkaline_earth_metals: 'alkaline_earth_metals',
    alkali_metals: 'alkali_metals',
}
export const PgEnumPeriodicGroup = pgEnum('periodic_group', Object.values(EnumPeriodicGroup) as [string, ...string[]]);