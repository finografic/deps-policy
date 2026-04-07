# Get Release Changelog between versions

## Option 1: GitHub Compare Link (Easiest!)

Simply visit this link to see all changes in your browser:

```
https://github.com/rolldown/tsdown/compare/v0.20.3...v0.21.7
```

Click and bookmark this! You can view diffs, commits, files changed, etc.

## Option 2: Terminal Commands

If you have the repo cloned locally:

```bash
# View commits between tags
git log v0.20.3..v0.21.7 --oneline

# See diff summary
git diff v0.20.3...v0.21.7 --stat

# Full detailed diff
git diff v0.20.3...v0.21.7

# See all changed files
git diff v0.20.3...v0.21.7 --name-only

# Generate a comparison report
git log v0.20.3..v0.21.7 --pretty=format:"%h - %s (%an)" > changelog.txt
```

## Quick Summary of v0.21.7 Changes:

From the comparison, major additions include:

✅ New CSS package (@tsdown/css) - Comprehensive CSS pipeline
✅ New exe package (@tsdown/exe) - Cross-platform executable building
✅ Root directory option - New root config option
✅ Executable bundling - exe option for Node.js SEA
✅ Deps namespace - Moved to deps.neverBundle, deps.alwaysBundle, etc.
✅ Enhanced documentation - New guides & API docs
✅ Migration tool improvements - Better tsup→tsdown migration

The GitHub Compare link is definitely the best for exploring interactively! 🚀
