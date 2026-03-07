import { useTranslation } from 'react-i18next';
import id from '../locales/id';

/**
 * Type representing the structure of our Indonesian translations.
 * Using this for the selector ensures "Go to Definition" works natively in the editor.
 */
export type TranslationSchema = typeof id.embeddedLocale.translation;

export type AppTranslation = {
    (selector: string, options?: any): string;
    <T>(selector: (s: TranslationSchema) => T, options?: any): string;
};

/**
 * A custom hook that provides a type-safe `t` function.
 * It supports both the standard string key and a selector function for full IDE navigation.
 * 
 * Usage:
 * const { t } = useAppTranslation();
 * t($ => $.landing.footer.brand.description) // Go to Definition works on 'description'
 */
export function useAppTranslation() {
    const { t: originalT, i18n } = useTranslation();

    /**
     * Type-safe translation function.
     * Returns string to satisfy React component props.
     */
    const t: AppTranslation = (
        selector: string | ((s: TranslationSchema) => any),
        options?: any
    ) => {
        if (typeof selector === 'function') {
            const path: string[] = [];

            const proxy = new Proxy({}, {
                get(_, prop) {
                    const propertyName = prop.toString();
                    path.push(propertyName);

                    const nestedProxy = (innerPath: string[]): any => {
                        return new Proxy({}, {
                            get(_, innerProp) {
                                const innerPropertyName = innerProp.toString();
                                innerPath.push(innerPropertyName);
                                return nestedProxy(innerPath);
                            }
                        });
                    };

                    return nestedProxy(path);
                }
            });

            selector(proxy as any);
            const key = path.join('.');
            return originalT(key as any, options) as unknown as string;
        }

        return originalT(selector as any, options) as unknown as string;
    };

    return { t, i18n };
}
