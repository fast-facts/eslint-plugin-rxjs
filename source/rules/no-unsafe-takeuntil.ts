/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs
 */

import { TSESTree as es } from "@typescript-eslint/utils";
import { stripIndent } from "common-tags";
import {
  getParent,
  getTypeServices,
  isCallExpression,
  isIdentifier,
  isMemberExpression,
} from "../etc";
import { ruleCreator } from "../utils";

const defaultOptions: readonly {
  alias?: string[];
  allow?: string[];
}[] = [];

type MessageIds = "forbidden";

const rule = ruleCreator<typeof defaultOptions, MessageIds>({
  defaultOptions,
  meta: {
    docs: {
      description: "Forbids the application of operators after `takeUntil`.",
      recommended: "error",
    },
    fixable: undefined,
    hasSuggestions: false,
    messages: {
      forbidden: "Applying operators after takeUntil is forbidden.",
    },
    schema: [
      {
        properties: {
          alias: { type: "array", items: { type: "string" } },
          allow: { type: "array", items: { type: "string" } },
        },
        type: "object",
        description: stripIndent`
          An optional object with optional \`alias\` and \`allow\` properties.
          The \`alias\` property is an array containing the names of operators that aliases for \`takeUntil\`.
          The \`allow\` property is an array containing the names of the operators that are allowed to follow \`takeUntil\`.`,
      },
    ],
    type: "problem",
  },
  name: "no-unsafe-takeuntil",
  create: (context, [unused]) => {
    let checkedOperatorsRegExp = /^takeUntil$/;
    const allowedOperators = [
      "count",
      "defaultIfEmpty",
      "endWith",
      "every",
      "finalize",
      "finally",
      "isEmpty",
      "last",
      "max",
      "min",
      "publish",
      "publishBehavior",
      "publishLast",
      "publishReplay",
      "reduce",
      "share",
      "shareReplay",
      "skipLast",
      "takeLast",
      "throwIfEmpty",
      "toArray",
    ];
    const [config = {}] = context.options;
    const { alias, allow = allowedOperators } = config;

    if (alias) {
      checkedOperatorsRegExp = new RegExp(
        `^(${alias.concat("takeUntil").join("|")})$`
      );
    }

    const { couldBeObservable } = getTypeServices(context);

    function checkNode(node: es.CallExpression) {
      const pipeCallExpression = getParent(node) as es.CallExpression;
      if (
        !pipeCallExpression.arguments ||
        !couldBeObservable(pipeCallExpression)
      ) {
        return;
      }

      type State = "allowed" | "disallowed" | "taken";

      pipeCallExpression.arguments.reduceRight((state, arg) => {
        if (state === "taken") {
          return state;
        }

        if (!isCallExpression(arg)) {
          return "disallowed";
        }

        let operatorName: string;
        if (isIdentifier(arg.callee)) {
          operatorName = arg.callee.name;
        } else if (
          isMemberExpression(arg.callee) &&
          isIdentifier(arg.callee.property)
        ) {
          operatorName = arg.callee.property.name;
        } else {
          return "disallowed";
        }

        if (checkedOperatorsRegExp.test(operatorName)) {
          if (state === "disallowed") {
            context.report({
              messageId: "forbidden",
              node: arg.callee,
            });
          }
          return "taken";
        }

        if (!allow.includes(operatorName)) {
          return "disallowed";
        }
        return state;
      }, "allowed" as State);
    }

    return {
      [`CallExpression[callee.property.name='pipe'] > CallExpression[callee.name=${checkedOperatorsRegExp}]`]:
        checkNode,
      [`CallExpression[callee.property.name='pipe'] > CallExpression[callee.property.name=${checkedOperatorsRegExp}]`]:
        checkNode,
    };
  },
});

export = rule;
