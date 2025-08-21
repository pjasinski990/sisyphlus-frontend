import js from "@eslint/js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import stylistic from "@stylistic/eslint-plugin";
import boundaries from "eslint-plugin-boundaries";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
    {
        settings: {
            react: { version: "detect" },
            "boundaries/elements": [
                { type: "shared", pattern: "src/shared/**" },
                { type: "app-init", pattern: "src/app-init/**" },
                {
                    type: "feature-interface",
                    mode: "folder",
                    pattern: "src/feature/*/interface/**",
                    capture: ["feature"],
                },
                {
                    type: "feature",
                    mode: "folder",
                    pattern: "src/feature/*/**",
                    capture: ["feature"],
                },
                { type: "src", pattern: "src/**" },
            ],
        },
        plugins: { boundaries },
        rules: {
            "boundaries/no-unknown-files": "error",
            "boundaries/no-ignored": "error",
            "boundaries/no-unknown": "error",

            "boundaries/element-types": [
                "error",
                {
                    default: "disallow",
                    rules: [
                        // everyone can import shared
                        { from: "*", allow: ["shared"] },

                        // shared -> only shared
                        { from: "shared", allow: ["shared"] },

                        // feature internals can import shared and itself
                        {
                            from: [["feature", { feature: "*" }]],
                            allow: [
                                ["feature", { feature: "${from.feature}" }],
                                ["feature-interface", { feature: "${from.feature}" }],
                                "shared",
                            ],
                        },

                        // feature interface can import shared and its own internals/interface
                        {
                            from: [["feature-interface", { feature: "*" }]],
                            allow: [
                                ["feature", { feature: "${from.feature}" }],
                                ["feature-interface", { feature: "${from.feature}" }],
                                "shared",
                            ],
                        },

                        // only app-init can import features, and only via /interface/**
                        {
                            from: "app-init",
                            allow: ["shared", "feature-interface"],
                        },

                        // anywhere else in src cannot import features directly
                        {
                            from: "src",
                            allow: ["app-init"],
                            disallow: ["feature", "feature-interface"],
                        }
                    ],
                },
            ],
        },
    },

    js.configs.recommended,
    ...compat.extends(
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript"
    ),

    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: { jsx: true },
                project: "./tsconfig.json",
            },
        },
        settings: {
            "import/resolver": { typescript: { alwaysTryTypes: true } },
        },
        plugins: { "@stylistic": stylistic },
        rules: {
            indent: "off",
            semi: "off",
            quotes: "off",
            "jsx-quotes": "off",
            "eol-last": "off",

            "@stylistic/indent": ["error", 4, { SwitchCase: 1 }],
            "@stylistic/semi": ["error", "always"],
            "@stylistic/quotes": ["error", "single", { avoidEscape: true }],
            "@stylistic/jsx-quotes": ["error", "prefer-single"],
            "@stylistic/eol-last": ["error", "always"],

            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
        },
    },
    {
        ignores: [
            "**/node_modules/**",
            "**/dist/**",
            "**/build/**",
            "**/.vite/**",
            "postcss.config.js",
            "tailwind.config.js",
            "tailwind.config.ts",
            "vitest.*",
            "vite.*",
            "eslint.config.mjs"
        ],
    },
];

export default config;
