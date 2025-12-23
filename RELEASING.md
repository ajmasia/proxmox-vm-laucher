# Release Process

This document describes the release process for pvel (Proxmox VM Launcher).

## Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backwards compatible manner
- **PATCH** version for backwards compatible bug fixes

Format: `MAJOR.MINOR.PATCH` (e.g., `0.2.0`)

## Creating a Release

### 1. Prepare the Release

Create a new branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b release/v0.x.x
```

### 2. Update Version Numbers

Update the version in these files:
- `src-tauri/tauri.conf.json` → `version` field
- `package.json` → `version` field

```bash
# Example for version 0.2.0
# Edit both files to change version to "0.2.0"
```

### 3. Commit Version Changes

```bash
git add src-tauri/tauri.conf.json package.json
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
- ✅ Build the application for macOS
  - Generate universal `.dmg` (Intel + Apple Silicon)
- ✅ Create a draft release on GitHub with:
  - Release notes with emojis and formatted sections
  - Installation instructions for each platform
  - All build artifacts attached

### 7. Finalize Release

1. Go to [GitHub Releases](https://github.com/ajmasia/proxmox-vm-laucher/releases)
2. Find the draft release for your version
3. Review the release notes
4. Edit if needed (add specific changelog, breaking changes, etc.)
5. Publish the release

## Release Checklist

Before creating a release, ensure:

- [ ] All features for the release are merged to `main`
- [ ] Version numbers updated in `tauri.conf.json` and `package.json`
- [ ] Application builds successfully locally (`npm run tauri build`)
- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] CHANGELOG.md updated (if exists)
- [ ] Tag created with correct format `v0.x.x`
- [ ] GitHub Actions workflow completes successfully
- [ ] Release notes reviewed and published

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

3. Bump PATCH version (e.g., `0.2.0` → `0.2.1`)

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
- **pvel_VERSION_amd64.deb** - Debian/Ubuntu package
- **pvel_VERSION_amd64.AppImage** - Universal Linux binary

### macOS
- **pvel_VERSION_universal.dmg** - Universal binary (Intel + Apple Silicon)

## Troubleshooting

### Build Fails on GitHub Actions

1. Check the [Actions tab](https://github.com/ajmasia/proxmox-vm-laucher/actions)
2. Review the workflow logs
3. Common issues:
   - Missing dependencies (check Ubuntu dependencies installation)
   - Node/Rust version mismatch
   - Tauri configuration errors

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
