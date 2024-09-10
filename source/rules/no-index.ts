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
      description: "Forbids the importation from index modules.",
      recommended: "error",
    },
    fixable: undefined,
    hasSuggestions: false,
    messages: {
      forbidden: "RxJS imports from index modules are forbidden.",
    },
    schema: [],
    type: "problem",
  },
  name: "no-index",
  create: (context) => {
    return {
      [String.raw`ImportDeclaration Literal[value=/^rxjs(?:\u002f\w+)?\u002findex/]`]:
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
