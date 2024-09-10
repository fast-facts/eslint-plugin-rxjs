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
      description: "Forbids the use of the `toPromise` method.",
      recommended: false,
    },
    fixable: undefined,
    hasSuggestions: false,
    messages: {
      forbidden: "The toPromise method is forbidden.",
    },
    schema: [],
    type: "problem",
  },
  name: "no-topromise",
  create: (context) => {
    const { couldBeObservable } = getTypeServices(context);
    return {
      [`MemberExpression[property.name="toPromise"]`]: (
        node: es.MemberExpression
      ) => {
        if (couldBeObservable(node.object)) {
          context.report({
            messageId: "forbidden",
            node: node.property,
          });
        }
      },
    };
  },
});

export = rule;
