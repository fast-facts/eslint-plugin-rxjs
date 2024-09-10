/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs
 */

import { TSESTree as es } from "@typescript-eslint/utils";
import { stripIndent } from "common-tags";
import decamelize from "decamelize";
import { defaultObservable } from "../constants";
import {
  getTypeServices,
  isCallExpression,
  isIdentifier,
  isLiteral,
  isMemberExpression,
} from "../etc";
import { createRegExpForWords, ruleCreator } from "../utils";

const defaultOptions: readonly {
  allow?: string | string[];
  disallow?: string | string[];
  observable?: string;
}[] = [];

type MessageIds = "forbidden";

const rule = ruleCreator<typeof defaultOptions, MessageIds>({
  defaultOptions,
  meta: {
    docs: {
      description: "Forbids unsafe `switchMap` usage in effects and epics.",
      recommended: false,
    },
    fixable: undefined,
    hasSuggestions: false,
    messages: {
      forbidden: "Unsafe switchMap usage in effects and epics is forbidden.",
    },
    schema: [
      {
        properties: {
          allow: {
            oneOf: [
              { type: "string" },
              { type: "array", items: { type: "string" } },
            ],
          },
          disallow: {
            oneOf: [
              { type: "string" },
              { type: "array", items: { type: "string" } },
            ],
          },
          observable: {
            oneOf: [
              { type: "string" },
              { type: "array", items: { type: "string" } },
            ],
          },
        },
        type: "object",
        description: stripIndent`
          An optional object with optional \`allow\`, \`disallow\` and \`observable\` properties.
          The properties can be specified as regular expression strings or as arrays of words.
          The \`allow\` or \`disallow\` properties are mutually exclusive. Whether or not
          \`switchMap\` is allowed will depend upon the matching of action types with \`allow\` or \`disallow\`.
          The \`observable\` property is used to identify the action observables from which effects and epics are composed.
        `,
      },
    ],
    type: "problem",
  },
  name: "no-unsafe-switchmap",
  create: (context, [unused]) => {
    const defaultDisallow = [
      "add",
      "create",
      "delete",
      "post",
      "put",
      "remove",
      "set",
      "update",
    ];

    let allowRegExp: RegExp | undefined;
    let disallowRegExp: RegExp | undefined;
    let observableRegExp: RegExp;

    const [config = {}] = context.options;
    if (config.allow || config.disallow) {
      allowRegExp = createRegExpForWords(config.allow ?? []);
      disallowRegExp = createRegExpForWords(config.disallow ?? []);
      observableRegExp = new RegExp(config.observable ?? defaultObservable);
    } else {
      allowRegExp = undefined;
      disallowRegExp = createRegExpForWords(defaultDisallow);
      observableRegExp = new RegExp(defaultObservable);
    }

    const { couldBeObservable } = getTypeServices(context);

    function shouldDisallow(args: es.Node[]): boolean {
      const names = args
        .map((arg) => {
          if (isLiteral(arg) && typeof arg.value === "string") {
            return arg.value;
          }
          if (isIdentifier(arg)) {
            return arg.name;
          }
          if (isMemberExpression(arg) && isIdentifier(arg.property)) {
            return arg.property.name;
          }

          return "";
        })
        .map((name) => decamelize(name));

      if (allowRegExp) {
        return !names.every((name) => allowRegExp?.test(name));
      }
      if (disallowRegExp) {
        return names.some((name) => disallowRegExp?.test(name));
      }

      return false;
    }

    function checkNode(node: es.CallExpression) {
      if (!node.arguments || !couldBeObservable(node)) {
        return;
      }

      const hasUnsafeOfType = node.arguments.some((arg) => {
        if (
          isCallExpression(arg) &&
          isIdentifier(arg.callee) &&
          arg.callee.name === "ofType"
        ) {
          return shouldDisallow(arg.arguments);
        }
        return false;
      });
      if (!hasUnsafeOfType) {
        return;
      }

      node.arguments.forEach((arg) => {
        if (
          isCallExpression(arg) &&
          isIdentifier(arg.callee) &&
          arg.callee.name === "switchMap"
        ) {
          context.report({
            messageId: "forbidden",
            node: arg.callee,
          });
        }
      });
    }

    return {
      [`CallExpression[callee.property.name='pipe'][callee.object.name=${observableRegExp}]`]:
        checkNode,
      [`CallExpression[callee.property.name='pipe'][callee.object.property.name=${observableRegExp}]`]:
        checkNode,
    };
  },
});

export = rule;
