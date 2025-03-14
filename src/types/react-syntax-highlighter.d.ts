declare module "react-syntax-highlighter" {
  import { ComponentType, ReactNode } from "react";

  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    children?: ReactNode;
    className?: string;
    PreTag?: string | ComponentType<any>;
    [key: string]: any;
  }

  const SyntaxHighlighter: ComponentType<SyntaxHighlighterProps>;
  export { SyntaxHighlighter };
  export const Prism: typeof SyntaxHighlighter;
}

declare module "react-syntax-highlighter/dist/esm/styles/prism" {
  const atomDark: any;
  export { atomDark };
}
