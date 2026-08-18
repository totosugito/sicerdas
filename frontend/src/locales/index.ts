import id from "./id"
import en from "./en"

const locales = [id, en];
export default locales;
export const languages = locales.map((locale) => locale.language);
export const embeddedLocales = locales.reduce(
  (result, locale) => ({
    ...result,
    [locale.language]: locale.embeddedLocale,
  }),
  {},
);
