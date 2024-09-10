/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs
 */

import { TSESTree as es } from "@typescript-eslint/utils";
import { getTypeServices } from "../etc";
import { ruleCreator } from "../utils";

type Options = readonly Record<string, boolean | string>[];
type MessageIds = "forbidden";

const defaultOptions: Options = [{}];

const rule = ruleCreator<Options, MessageIds>({
  defaultOptions,
  meta: {
    docs: {
      description:
        "Forbids the calling of `subscribe` without specifying arguments.",
      recommended: false,
    },
    fixable: undefined,
    hasSuggestions: false,
    messages: {
      forbidden: "Calling subscribe without arguments is forbidden.",
    },
    schema: [],
    type: "problem",
  },
  name: "no-ignored-subscribe",
  create: (context) => {
    const { couldBeObservable, couldBeType } = getTypeServices(context);

    return {
      "CallExpression[arguments.length = 0][callee.property.name='subscribe']":
        (node: es.CallExpression) => {
          const callee = node.callee as es.MemberExpression;
          if (
            couldBeObservable(callee.object) ||
            couldBeType(callee.object, "Subscribable")
          ) {
            context.report({
              messageId: "forbidden",
              node: callee.property,
            });
          }
        },
    };
  },
});

export = rule;
