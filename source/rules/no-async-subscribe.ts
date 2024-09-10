/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs
 */

import { TSESTree as es } from "@typescript-eslint/utils";
import { getParent, getTypeServices } from "../etc";
import { ruleCreator } from "../utils";

type Options = readonly Record<string, boolean | string>[];
type MessageIds = "forbidden";

const defaultOptions: Options = [{}];

const rule = ruleCreator<Options, MessageIds>({
  defaultOptions,
  meta: {
    docs: {
      description: "Forbids passing `async` functions to `subscribe`.",
      recommended: "error",
    },
    fixable: undefined,
    hasSuggestions: false,
    messages: {
      forbidden: "Passing async functions to subscribe is forbidden.",
    },
    schema: [],
    type: "problem",
  },
  name: "no-async-subscribe",
  create: (context) => {
    const { couldBeObservable } = getTypeServices(context);

    function checkNode(
      node: es.FunctionExpression | es.ArrowFunctionExpression
    ) {
      const parentNode = getParent(node) as es.CallExpression;
      const callee = parentNode.callee as es.MemberExpression;

      if (couldBeObservable(callee.object)) {
        const { loc } = node;
        // only report the `async` keyword
        const asyncLoc = {
          ...loc,
          end: {
            ...loc.start,
            column: loc.start.column + 5,
          },
        };

        context.report({
          messageId: "forbidden",
          loc: asyncLoc,
        });
      }
    }
    return {
      "CallExpression[callee.property.name='subscribe'] > FunctionExpression[async=true]":
        checkNode,
      "CallExpression[callee.property.name='subscribe'] > ArrowFunctionExpression[async=true]":
        checkNode,
    };
  },
});

export = rule;
