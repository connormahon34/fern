import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "../../../ValidationViolation";
import { ValidBasePathRule } from "../valid-base-path";

describe("valid-base-path", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidBasePathRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            ),
        });

        const expectedViolations: ValidationViolation[] = [
            {
                message: "base-path cannot end with a slash.",
                nodePath: [],
                relativeFilepath: RelativeFilePath.of("api.yml"),
                severity: "error",
            },
            {
                message: "base-path must be empty or start with a slash.",
                nodePath: ["service"],
                relativeFilepath: RelativeFilePath.of("no-leading-slash.yml"),
                severity: "error",
            },
            {
                message: "base-path cannot end with a slash.",
                nodePath: ["service"],
                relativeFilepath: RelativeFilePath.of("trailing-slash.yml"),
                severity: "error",
            },
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
