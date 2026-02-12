import nextConfig from "eslint-config-next/core-web-vitals";
import tsConfig from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextConfig,
  ...tsConfig,
  {
    rules: {
      // Disabled: we use setState in effects for SSR-safe localStorage reads
      // and the mounted hydration pattern. This is intentional and well-understood.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
