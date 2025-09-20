# Commit Message Guidelines

> **Note:** For information on branch naming conventions and branching strategy, see the [CONTRIBUTING.md](./CONTRIBUTING.md) file.

These guidelines help keep the project history clean, understandable, and welcoming for all contributors. Please follow them for every commit.

## 1. Use Conventional Commits

Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification:

```
<type>[optional scope]: <short summary>

[optional body]

[optional footer(s)]
```

- **type**: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert
- **scope**: (optional) area of codebase (e.g., api, playwright, docs)
- **summary**: concise, imperative mood ("add", not "added"/"adds")
- **body**: (optional) explain what/why, not how
- **footer**: references issues (e.g., `Closes #123`), breaking changes, or DCO sign-off

### Examples
- `feat(api): add OAuth2 client credentials flow`
- `fix(playwright): resolve config loading for headers`
- `docs: clarify PR process`
- `refactor: extract device broker logic`

## 2. Write Clear, Descriptive Messages
- Summarize the change in the first line (max 72 chars)
- Separate summary from body with a blank line
- Use the body to explain the motivation, context, or consequences
- Reference related issues/PRs in the footer

## 3. Sign Your Commits (DCO)
- All commits must be signed off to certify you have the right to submit the work ([Developer Certificate of Origin](https://developercertificate.org/))
- Add a sign-off line at the end of your commit message:
  - `Signed-off-by: Your Name <your@email.com>`
- Use `git commit -s` to add this automatically

## 4. One Logical Change Per Commit
- Each commit should do one thing: fix a bug, add a feature, refactor, etc.
- Avoid mixing unrelated changes in a single commit
- Large changes: split into smaller, self-contained commits

## 5. No WIP/Temporary Commits in Main Branch
- Squash or rebase to remove work-in-progress, "fix typo", or "update" commits before merging
- Use meaningful commit messages for all history in main branches

## 6. Breaking Changes
- If a commit introduces a breaking change, include a `BREAKING CHANGE:` footer with details and migration steps
- Example:
  - `BREAKING CHANGE: removes deprecated device broker API`

## 7. Linting and CI
- Commit messages are checked by CI for Conventional Commit compliance
- PRs with invalid commit messages may be rejected

## 8. Example Commit Message
```
feat(api): add OAuth2 client credentials flow

Implements the client credentials grant for OAuth2 in the API client.
This allows service-to-service authentication for automation.

Closes #42
Signed-off-by: Jane Doe <jane@example.com>
```

## 9. Resources
- [Conventional Commits](https://www.conventionalcommits.org/)
- [DCO](https://developercertificate.org/)
- [How to Write a Git Commit Message](https://cbea.ms/git-commit/)

---

By contributing, you agree to follow these guidelines and the project Code of Conduct.
