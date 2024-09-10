/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs
 */

import { TSESLint as eslint, TSESTree as es } from "@typescript-eslint/utils";
import { ruleCreator } from "../utils";

type Options = readonly Record<string, boolean | string>[];
type MessageIds = "macro";

const defaultOptions: Options = [{}];

const rule = ruleCreator<Options, MessageIds>({
  defaultOptions,
  meta: {
    docs: {
      description: "Enforces the use of the RxJS Tools Babel macro.",
      recommended: false,
    },
    fixable: "code",
    hasSuggestions: false,
    messages: {
      macro: "Use the RxJS Tools Babel macro.",
    },
    schema: [],
    type: "problem",
  },
  name: "macro",
  create: (context) => {
    let hasFailure = false;
    let hasMacroImport = false;
    let program: es.Program | undefined = undefined;

    function fix(fixer: eslint.RuleFixer) {
      return fixer.insertTextBefore(
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        program!,
        `import "babel-plugin-rxjs-tools/macro";\n`
      );
    }

    return {
      "CallExpression[callee.property.name=/^(pipe|subscribe)$/]": (
        node: es.CallExpression
      ) => {
        if (hasFailure || hasMacroImport) {
          return;
        }
        hasFailure = true;
        context.report({
          fix,
          messageId: "macro",
          node: node.callee,
        });
      },
      "ImportDeclaration[source.value='babel-plugin-rxjs-tools/macro']": (
        node: es.ImportDeclaration
      ) => {
        hasMacroImport = true;
      },
      [String.raw`ImportDeclaration[source.value=/^rxjs(\u002f|$)/]`]: (
        node: es.ImportDeclaration
      ) => {
        if (hasFailure || hasMacroImport) {
          return;
        }
        hasFailure = true;
        context.report({
          fix,
          messageId: "macro",
          node,
        });
      },
      Program: (node: es.Program) => {
        program = node;
      },
    };
  },
});

export = rule;
