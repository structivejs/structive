# Version Management

## Current Version
**1.6.4**

## Quick Version Update (Recommended)

Use npm's built-in version command:

```bash
# Patch release (1.6.0 → 1.6.1) - Bug fixes
npm version patch

# Minor release (1.6.0 → 1.7.0) - New features (backward compatible)
npm version minor

# Major release (1.6.0 → 2.0.0) - Breaking changes
npm version major
```

This will automatically:
1. Run tests (`preversion` hook)
2. Update version in `package.json`
3. Clean and rebuild (`version` hook)
4. Create a git commit with the new version
5. Create a git tag (e.g., `v1.6.0`)
6. Push changes and tags to remote (`postversion` hook)

## Manual Update (Alternative)

If you need to update manually, modify the following file:

1. **`package.json`** - Update the `version` field
   ```json
   "version": "1.6.0"  // Update this
   ```

## Release Checklist

- [ ] Ensure all changes are committed
- [ ] Run `npm version [patch|minor|major]`
- [ ] Verify git tag was created: `git tag`
- [ ] Publish to npm: `npm publish`
- [ ] Update CHANGELOG.md (if exists)

## Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features (backward compatible)
- **PATCH** (0.0.X): Bug fixes (backward compatible)
