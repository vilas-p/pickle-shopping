# Copilot Instructions
 
## General Rules
 
- Make the smallest possible change required to solve the requested task.
- Do not refactor unrelated code.
- Do not modify files that are not required for the task.
- Do not introduce new abstractions unless they are necessary.
- Prefer the existing project patterns and utilities over creating new ones.
- Do not change dependencies unless explicitly requested or required.
- Do not rename classes, methods, variables, or files unless explicitly requested.
 
## Investigation
 
- Start by inspecting only the files directly relevant to the task.
- Do not scan the entire repository unless necessary.
- Do not inspect unrelated modules.
- If the issue can be solved from the available context, do not perform additional exploration.
 
## Implementation
 
- Before making changes, identify the simplest solution.
- Implement the minimal change.
- Preserve existing behavior outside the requested change.
- Avoid speculative improvements.
 
## Validation
 
- Run only the tests/build commands relevant to the changed code.
- Do not repeatedly rerun the same failing command without changing the approach.
- If a test fails, analyze the failure before attempting another change.
 
## Agent Behavior
 
- Do not enter repeated trial-and-error loops.
- Do not generate alternative implementations unless the first approach is demonstrably unsuitable.
- Stop once the requested change is implemented and the relevant validation succeeds.
- If requirements are ambiguous, ask for clarification instead of making large assumptions.
 
## Output
 
At the end, provide:
1. Files changed
2. What changed
3. Validation performed
4. Any remaining issue