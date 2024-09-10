/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs
 */

import { stripIndent } from "common-tags";
import { fromFixture } from "../../source/etc/from-fixture";
import * as rule from "../../source/rules/ban-observables";
import { ruleTester } from "../utils";

ruleTester({ types: false }).run("ban-observables", rule, {
  valid: [
    {
      code: `import { of, Observable } from "rxjs";`,
    },
  ],
  invalid: [
    fromFixture(
      stripIndent`
        import { of, Observable as o, Subject } from "rxjs";
                 ~~ [forbidden { "name": "of", "explanation": "" }]
                     ~~~~~~~~~~ [forbidden { "name": "Observable", "explanation": ": because I say so" }]
      `,
      {
        options: [
          {
            of: true,
            Observable: "because I say so",
            Subject: false,
          },
        ],
      }
    ),
  ],
});
