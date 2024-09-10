/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs
 */

import { stripIndent } from "common-tags";
import { fromFixture } from "../../source/etc";
import * as rule from "../../source/rules/no-async-subscribe";
import { ruleTester } from "../utils";

ruleTester({ types: true }).run("no-async-subscribe", rule, {
  valid: [
    stripIndent`
      // sync arrow function
      import { of } from "rxjs";

      of("a").subscribe(() => {});
    `,
    stripIndent`
      // sync function
      import { of } from "rxjs";

      of("a").subscribe(function() {});
    `,
    stripIndent`
      // https://github.com/cartant/eslint-plugin-rxjs/issues/46
      import React, { FC } from "react";
      const SomeComponent: FC<{}> = () => <span>some component</span>;
      const someElement = <SomeComponent />;
    `,
    stripIndent`
      // https://github.com/cartant/eslint-plugin-rxjs/issues/61
      const whatever = {
        subscribe(next?: (value: unknown) => void) {}
      };
      whatever.subscribe(async () => { await 42; });
    `,
  ],
  invalid: [
    fromFixture(
      stripIndent`
        // async arrow function
        import { of } from "rxjs";

        of("a").subscribe(async () => {
                          ~~~~~ [forbidden]
          return await "a";
        });
      `
    ),
    fromFixture(
      stripIndent`
        // async function
        import { of } from "rxjs";

        of("a").subscribe(async function() {
                          ~~~~~ [forbidden]
          return await "a";
        });
      `
    ),
  ],
});
