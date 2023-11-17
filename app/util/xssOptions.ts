import { type IFilterXSSOptions } from "xss";

export const xssOptions = {
  css: {
    whiteList: {
      "text-align": /^left|right|center|justify$/,
    },
  },
  whiteList: {
    a: ["href", "title", "target", "rel"],
    blockquote: [],
    br: [],
    code: [],
    em: [],
    h3: ["style"],
    h4: ["style"],
    h5: ["style"],
    h6: ["style"],
    hr: [],
    li: ["style"],
    mark: [],
    ol: ["style"],
    p: ["style"],
    s: [],
    span: [],
    strong: [],
    sub: [],
    sup: [],
    u: [],
    ul: ["style"],
  },
} as IFilterXSSOptions;
