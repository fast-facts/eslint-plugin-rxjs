/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs
 */

import { TSESTree as es } from "@typescript-eslint/utils";
import { stripIndent } from "common-tags";
import { ruleCreator } from "../utils";

type Options = readonly Record<string, boolean | string>[];
type MessageIds = "forbidden";

const defaultOptions: Options = [{}];

const rule = ruleCreator<Options, MessageIds>({
  defaultOptions,
  meta: {
    docs: {
      description: "Forbids the use of banned observables.",
      recommended: false,
    },
    fixable: undefined,
    hasSuggestions: false,
    messages: {
      forbidden: "RxJS observable is banned: {{name}}{{explanation}}.",
    },
    schema: [
      {
        type: "object",
        description: stripIndent`
          An object containing keys that are names of observable factory functions
          and values that are either booleans or strings containing the explanation for the ban.`,
      },
    ],
    type: "problem",
  },
  name: "ban-observables",
  create: (context, [unused]) => {
    const bans: { explanation: string; regExp: RegExp }[] = [];

    const [config] = context.options;
    if (!config) {
      return {};
    }

    Object.entries(config).forEach(([key, value]) => {
      if (value !== false) {
        bans.push({
          explanation: typeof value === "string" ? value : "",
          regExp: new RegExp(`^${key}$`),
        });
      }
    });

    function getFailure(name: string) {
      for (let b = 0, length = bans.length; b < length; ++b) {
        const ban = bans[b];
        if (ban.regExp.test(name)) {
          const explanation = ban.explanation ? `: ${ban.explanation}` : "";
          return {
            messageId: "forbidden",
            data: { name, explanation },
          } as const;
        }
      }
      return undefined;
    }

    return {
      "ImportDeclaration[source.value='rxjs'] > ImportSpecifier": (
        node: es.ImportSpecifier
      ) => {
        const identifier = node.imported;
        if ('name' in identifier) {
          const failure = getFailure(identifier.name);
          if (failure) {
            context.report({
              ...failure,
              node: identifier,
            });
          }
        }
      },
    };
  },
});

export = rule;
