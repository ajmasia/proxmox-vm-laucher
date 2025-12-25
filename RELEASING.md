# Release Process

This document describes the release process for PVE Launcher.

## Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backwards compatible manner
- **PATCH** version for backwards compatible bug fixes

Format: `MAJOR.MINOR.PATCH` (e.g., `0.5.0`)

## Creating a Release

### 1. Prepare the Release

Create a new branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b release/v0.x.x
```

### 2. Update Version Number

Update the version in `package.json`:

```bash
# Example for version 0.5.0
# Edit package.json to change version to "0.5.0"
```

### 3. Commit Version Changes

```bash
git add package.json
git commit -m "chore: bump version to 0.x.x"
```

### 4. Merge to Main

```bash
git checkout main
git merge release/v0.x.x --no-ff
git push origin main
```

### 5. Create and Push Tag

```bash
git tag v0.x.x
git push origin v0.x.x
```

### 6. Automated Release

Once the tag is pushed, GitHub Actions will automatically:
- ✅ Build the application for Linux (Ubuntu 22.04)
  - Generate `.deb` package
  - Generate `.AppImage`
  - Generate `.rpm` package
- ✅ Build the application for macOS
  - Generate `.dmg` (Intel + Apple Silicon)
- ✅ Create a GitHub release with:
  - All build artifacts attached
  - Auto-generated release notes

### 7. Finalize Release

1. Go to [GitHub Releases](https://github.com/your-org/pve-launcher/releases)
2. Find the release for your version
3. Review and edit release notes if needed
4. Publish the release

## Release Checklist

Before creating a release, ensure:

- [ ] All features for the release are merged to `main`
- [ ] Version number updated in `package.json`
- [ ] Application builds successfully locally (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] Tag created with correct format `v0.x.x`
- [ ] GitHub Actions workflow completes successfully

## Hotfix Releases

For urgent bug fixes:

1. Create a hotfix branch from the tag:
   ```bash
   git checkout -b hotfix/v0.x.x v0.x.x
   ```

2. Make the fix and commit:
   ```bash
   git commit -m "fix: critical bug description"
   ```

3. Bump PATCH version (e.g., `0.5.0` → `0.5.1`)

4. Merge to main and tag:
   ```bash
   git checkout main
   git merge hotfix/v0.x.x --no-ff
   git tag v0.x.x
   git push origin main v0.x.x
   ```

## Build Artifacts

Each release generates the following artifacts:

### Linux
- **pve-launcher_VERSION_amd64.deb** - Debian/Ubuntu package
- **pve-launcher_VERSION_amd64.AppImage** - Universal Linux binary
- **pve-launcher_VERSION_amd64.rpm** - Fedora/RHEL package

### macOS
- **pve-launcher_VERSION.dmg** - macOS disk image

## Troubleshooting

### Build Fails on GitHub Actions

1. Check the [Actions tab](https://github.com/your-org/pve-launcher/actions)
2. Review the workflow logs
3. Common issues:
   - Missing dependencies
   - Node version mismatch
   - Electron build configuration errors

### Release Not Created

Ensure:
- Tag format is correct: `v0.x.x` (must start with `v`)
- GitHub Actions has `contents: write` permission
- `GITHUB_TOKEN` secret is available

## Rolling Back a Release

If a release has critical issues:

1. Delete the tag:
   ```bash
   git tag -d v0.x.x
   git push origin :refs/tags/v0.x.x
   ```

2. Delete the GitHub release (from web interface)

3. Fix the issues and create a new patch release
