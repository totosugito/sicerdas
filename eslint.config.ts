import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import unusedImports from "eslint-plugin-unused-imports";

export default [
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tsParser,
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "unused-imports": unusedImports,
        },
        rules: {
            "@typescript-eslint/no-unused-vars": "off",

            "unused-imports/no-unused-imports": "warn",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    varsIgnorePattern: "^_",
                    argsIgnorePattern: "^_",
                },
            ],
        },
    },
];
