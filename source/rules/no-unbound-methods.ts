/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs
 */

import { TSESTree as es } from "@typescript-eslint/utils";
import {
  getParent,
  getTypeServices,
  isCallExpression,
  isMemberExpression,
} from "../etc";
import { ruleCreator } from "../utils";

type Options = readonly Record<string, boolean | string>[];
type MessageIds = "forbidden";

const defaultOptions: Options = [{}];

const rule = ruleCreator<Options, MessageIds>({
  defaultOptions,
  meta: {
    docs: {
      description: "Forbids the passing of unbound methods.",
      recommended: "error",
    },
    fixable: undefined,
    hasSuggestions: false,
    messages: {
      forbidden: "Unbound methods are forbidden.",
    },
    schema: [],
    type: "problem",
  },
  name: "no-unbound-methods",
  create: (context) => {
    const { couldBeObservable, couldBeSubscription, getType } =
      getTypeServices(context);
    const nodeMap = new WeakMap<es.Node, void>();

    function mapArguments(node: es.CallExpression | es.NewExpression) {
      node.arguments.filter(isMemberExpression).forEach((arg) => {
        const argType = getType(arg);
        if (argType.getCallSignatures().length > 0) {
          nodeMap.set(arg);
        }
      });
    }

    function isObservableOrSubscription(
      node: es.CallExpression,
      action: (node: es.CallExpression) => void
    ) {
      if (!isMemberExpression(node.callee)) {
        return;
      }

      if (
        couldBeObservable(node.callee.object) ||
        couldBeSubscription(node.callee.object)
      ) {
        action(node);
      }
    }

    return {
      "CallExpression[callee.property.name='pipe']": (
        node: es.CallExpression
      ) => {
        isObservableOrSubscription(node, ({ arguments: args }) => {
          args.filter(isCallExpression).forEach(mapArguments);
        });
      },
      "CallExpression[callee.property.name=/^(add|subscribe)$/]": (
        node: es.CallExpression
      ) => {
        isObservableOrSubscription(node, mapArguments);
      },
      "NewExpression[callee.name='Subscription']": mapArguments,
      ThisExpression: (node: es.ThisExpression) => {
        let parent = getParent(node);
        while (parent) {
          if (nodeMap.has(parent)) {
            context.report({
              messageId: "forbidden",
              node: parent,
            });
            return;
          }
          parent = getParent(parent);
        }
      },
    };
  },
});

export = rule;
