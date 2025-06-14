# Branch Protection Rules for Main

This file documents the recommended branch protection settings for the `main` branch.
Apply these settings in GitHub: Settings → Branches → Add rule

## Rule Configuration

### Target Branch
- Branch name pattern: `main`

### Protect matching branches

#### ✅ Require a pull request before merging
- [ ] Require approvals (optional for solo projects)
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require review from CODEOWNERS (optional)

#### ✅ Require status checks to pass before merging
- [x] Require branches to be up to date before merging
- Required status checks:
  - `quality` (from CI workflow)

#### ✅ Require conversation resolution before merging

#### ✅ Do not allow bypassing the above settings
- [ ] Include administrators (uncheck if you need emergency fixes)

### Additional settings

#### ✅ Restrict who can push to matching branches
- Add yourself as allowed user

#### ✅ Rules applied to everyone including administrators
- [x] Block force pushes
- [x] Block deletions

## Merge Settings (Repository Settings → General)

### Pull Requests
- [x] Allow squash merging
  - Default to pull request title and description
- [x] Allow merge commits
- [ ] Allow rebase merging

### Features
- [x] Automatically delete head branches

## Implementation Steps

1. Commit and push the CI workflow
2. Go to repository Settings → Branches
3. Click "Add rule"
4. Set branch name pattern to `main`
5. Configure settings as documented above
6. Click "Create" to save the rule