# Contributing to Critter

Thank you for your interest in contributing to Critter! We welcome all contributions—bug fixes, new features, documentation, and more. Please read the following guidelines to help us maintain a high-quality, collaborative project.

## Getting Started

- **Fork the repository** and create your branch from `main`.
- **Install dependencies** with `npm install`.
- **Run tests** and ensure everything passes before submitting changes.

## Branching Strategy

- **Create a new branch** for each feature, bugfix, or documentation update.
- **Branch naming convention:**
  - Use one of the following prefixes:
    - `feature/` for new features (e.g., `feature/add-auth`)
    - `bugfix/` for bug fixes (e.g., `bugfix/fix-login-error`)
    - `docs/` for documentation changes (e.g., `docs/update-contributing`)
    - `chore/` for maintenance (e.g., `chore/update-deps`)
- **How to create a branch:**
  ```sh
  git checkout main
  git pull origin main
  git checkout -b feature/your-feature-name
  ```
- **Keep branches focused:** Each branch should address a single change or issue.
- **Sync regularly:** Rebase or merge the latest `main` into your branch to minimize conflicts.

## Code of Conduct

By participating, you agree to abide by our Code of Conduct. Be respectful and constructive in all interactions.

## Commit Messages

- Follow the [COMMIT_GUIDELINES.md](./COMMIT_GUIDELINES.md) for detailed commit message rules.
- Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format (e.g., `feat:`, `fix:`, `docs:`, etc.).
- Sign your commits using `git commit -s` (DCO sign-off required).
- Each commit should represent a single logical change.
- Write clear, descriptive messages (see guidelines for examples).

## Pull Requests

- Follow the [PR_GUIDELINES.md](./PR_GUIDELINES.md) for submitting and reviewing PRs.
- Keep PRs focused and small; avoid unrelated changes.
- Ensure all CI checks pass (lint, typecheck, tests, build).
- Fill out the PR template and checklist.

## Code Style

- Code style is enforced via ESLint and Prettier.
- Run `npm run lint` and fix any issues before pushing.
- Use TypeScript and follow the project’s strict typing rules.

## Testing

- Add or update tests for all new features and bug fixes.
- Run the full test suite locally before submitting your PR.
- Ensure your changes do not break existing tests.

## Documentation

- Update documentation and examples for any user-facing changes.
- Add comments to complex code to help future contributors.

## Feature Requests & Issues

- Search existing issues and PRs before opening a new one.
- For significant changes, open an issue to discuss your proposal before starting work.

## Review Process

- Be responsive to review comments and suggestions.
- Address requested changes promptly.
- Reviewers: be kind, specific, and actionable in your feedback.

## Licensing

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for helping make Critter better! If you have any questions, open an issue or reach out to the maintainers.
