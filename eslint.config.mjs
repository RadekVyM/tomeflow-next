import nextConfig from "eslint-config-next";

const eslintConfig = [
    ...nextConfig,
    {
        rules: {
            "react-hooks/exhaustive-deps": "off",
            "react-hooks/refs": "off",
            "react-hooks/immutability": "off",
            "react-hooks/set-state-in-effect": "off",
            "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "react/no-children-prop": "off",
            "react/display-name": "off",
            "@next/next/no-img-element": "off",
            "jsx-a11y/alt-text": "off",
            "@typescript-eslint/no-unused-vars": "off",
        },
    },
];

export default eslintConfig;