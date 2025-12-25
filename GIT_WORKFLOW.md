# Git Workflow

This project uses a simplified Git Flow workflow without a `develop` branch.

## Branch Structure

- **`main`** - Production-ready code. All releases are tagged from here.
- **`feat/*`** - Feature branches for new functionality
- **`fix/*`** - Bug fix branches
- **`refactor/*`** - Code refactoring branches
- **`chore/*`** - Maintenance tasks (dependencies, config, etc.)
- **`release/*`** - Release preparation branches
- **`hotfix/*`** - Emergency fixes for production

## Workflow

### Starting New Work

Always branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b <type>/<description>
```

Examples:
```bash
git checkout -b feat/vm-snapshots
git checkout -b fix/login-bug
git checkout -b refactor/store-structure
git checkout -b chore/update-dependencies
```

### Working on a Feature

1. **Create branch**:
   ```bash
   git checkout -b feat/awesome-feature
   ```

2. **Make commits** following [conventional commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add VM snapshot functionality"
   git commit -m "test: add snapshot tests"
   git commit -m "docs: update README with snapshot info"
   ```

3. **Keep branch updated** with main:
   ```bash
   git checkout main
   git pull origin main
   git checkout feat/awesome-feature
   git rebase main
   ```

4. **Push your branch**:
   ```bash
   git push origin feat/awesome-feature
   ```

### Merging to Main

Two options:

#### Option 1: Direct Merge (Small Changes)

For small, reviewed changes:

```bash
git checkout main
git pull origin main
git merge feat/awesome-feature --no-ff
git push origin main
```

#### Option 2: Pull Request (Recommended)

1. Push your branch to GitHub
2. Create a Pull Request on GitHub
3. Review and approve
4. Merge using "Squash and merge" or "Merge commit"

### Release Process

See [RELEASING.md](./RELEASING.md) for detailed release process.

Quick overview:

```bash
# 1. Create release branch
git checkout -b release/v0.x.x

# 2. Bump version in package.json
# (edit file)

# 3. Commit version bump
git commit -m "chore: bump version to 0.x.x"

# 4. Merge to main
git checkout main
git merge release/v0.x.x --no-ff

# 5. Tag and push
git tag v0.x.x
git push origin main v0.x.x
```

### Hotfixes

For critical production bugs:

```bash
# 1. Branch from the tag
git checkout -b hotfix/v0.x.x v0.x.x

# 2. Fix the bug
git commit -m "fix: critical security issue"

# 3. Bump PATCH version

# 4. Merge to main
git checkout main
git merge hotfix/v0.x.x --no-ff
git tag v0.x.x
git push origin main v0.x.x
```

## Commit Message Convention

This project uses **conventional commits**.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **style**: Code style changes (formatting, semicolons, etc.)
- **test**: Adding or updating tests
- **docs**: Documentation only changes
- **chore**: Changes to build process, dependencies, etc.
- **ci**: Changes to CI configuration files

### Examples

```bash
feat: add VM snapshot functionality
fix: resolve login authentication issue
refactor: simplify VM store state management
perf: optimize VM list rendering with memoization
style: apply prettier formatting
test: add integration tests for SPICE connection
docs: update installation instructions
chore: upgrade Electron to v40
ci: add release automation workflow
```

### Scope (Optional)

```bash
feat(vm): add snapshot functionality
fix(auth): resolve token expiration
refactor(ui): simplify filter component
```

### Rules

✅ **DO**:
- Use imperative mood ("add" not "added")
- Keep first line under 72 characters
- Be descriptive and clear
- Reference issues if applicable (`fixes #123`)

❌ **DON'T**:
- Use past tense ("added", "fixed")
- Be vague ("update stuff", "fix things")

## Branch Naming

Follow this pattern: `<type>/<short-description>`

**Good**:
```
feat/vm-snapshots
fix/login-timeout
refactor/filter-logic
chore/update-deps
```

**Bad**:
```
feature-snapshots
my-branch
fix_bug
update
```

## Tips

1. **Commit often**: Small, focused commits are easier to review and revert
2. **Pull before push**: Always pull latest changes before pushing
3. **Rebase on main**: Keep your feature branch updated with main
4. **Clean history**: Use interactive rebase to clean up commits before merging
5. **Delete merged branches**: Keep repository clean

```bash
# Delete local branch
git branch -d feat/awesome-feature

# Delete remote branch
git push origin --delete feat/awesome-feature
```

## Conflicts Resolution

When rebasing or merging conflicts occur:

```bash
# 1. Resolve conflicts in your editor
# 2. Add resolved files
git add <resolved-files>

# 3. Continue rebase
git rebase --continue

# Or abort if needed
git rebase --abort
```

## Useful Commands

```bash
# View branch history
git log --oneline --graph --all

# See what changed
git diff main...feat/my-feature

# Stash changes
git stash
git stash pop

# Amend last commit
git commit --amend

# Interactive rebase (clean up last 3 commits)
git rebase -i HEAD~3
```
