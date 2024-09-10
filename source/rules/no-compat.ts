/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs
 */

import { TSESTree as es } from "@typescript-eslint/utils";
import { ruleCreator } from "../utils";

type Options = readonly Record<string, boolean | string>[];
type MessageIds = "forbidden";

const defaultOptions: Options = [{}];

const rule = ruleCreator<Options, MessageIds>({
  defaultOptions,
  meta: {
    docs: {
      description:
        "Forbids importation from locations that depend upon `rxjs-compat`.",
      recommended: false,
    },
    fixable: undefined,
    hasSuggestions: false,
    messages: {
      forbidden: "'rxjs-compat'-dependent import locations are forbidden.",
    },
    schema: [],
    type: "problem",
  },
  name: "no-compat",
  create: (context) => {
    return {
      [String.raw`ImportDeclaration Literal[value=/^rxjs\u002f/]:not(Literal[value=/^rxjs\u002f(ajax|fetch|operators|testing|webSocket)/])`]:
        (node: es.Literal) => {
          context.report({
            messageId: "forbidden",
            node,
          });
        },
    };
  },
});

export = rule;
