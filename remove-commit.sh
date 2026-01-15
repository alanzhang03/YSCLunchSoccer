#!/bin/bash

# Script to remove commit d6e9856 from git history
# This will remove Claude as a contributor by deleting the commit entirely

set -e  # Exit on error

COMMIT_TO_REMOVE="d6e9856"
PARENT_COMMIT="933bacc"  # From the GitHub page

echo "🔍 Checking if this is a git repository..."
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: This is not a git repository!"
    exit 1
fi

echo "✅ Git repository found"
echo ""

echo "📋 Current branch: $(git branch --show-current)"
echo ""

echo "🔍 Checking if commit $COMMIT_TO_REMOVE exists..."
if ! git cat-file -e "$COMMIT_TO_REMOVE^{commit}" 2>/dev/null; then
    echo "❌ Error: Commit $COMMIT_TO_REMOVE not found in this repository!"
    exit 1
fi

echo "✅ Commit $COMMIT_TO_REMOVE found"
echo ""

echo "📝 Commit details:"
git log --oneline -1 "$COMMIT_TO_REMOVE"
echo ""

# Check if we're on the main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo "⚠️  Warning: You're not on main/master branch. Current branch: $CURRENT_BRANCH"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: You have uncommitted changes!"
    echo "Please commit or stash them before running this script."
    exit 1
fi

echo "🔍 Finding the position of commit $COMMIT_TO_REMOVE in history..."
# Get the commit hash before the one we want to remove
COMMIT_BEFORE=$(git rev-parse "$COMMIT_TO_REMOVE^")

echo "✅ Found parent commit: $COMMIT_BEFORE"
echo ""

echo "📋 Recent commit history (showing last 10 commits):"
git log --oneline -10
echo ""

echo "⚠️  WARNING: This will rewrite git history!"
echo "⚠️  Anyone who has pulled this branch will need to reset their local copy."
echo ""
read -p "Are you sure you want to remove commit $COMMIT_TO_REMOVE? (yes/no) " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Aborted."
    exit 1
fi

echo ""
echo "🔄 Starting interactive rebase to remove the commit..."
echo ""

# Create a temporary script to automatically edit the rebase todo list
TEMP_EDITOR=$(mktemp)
cat > "$TEMP_EDITOR" << EDITOR_SCRIPT
#!/bin/bash
# This script automatically removes the line containing the commit hash from the rebase todo list
FILE="\$1"
# Remove the line containing the commit hash
# The commit hash will be in the format: pick d6e9856 <message>
# Use empty string for backup on macOS, or .bak for Linux
sed -i '' "/$COMMIT_TO_REMOVE/d" "\$FILE" 2>/dev/null || sed -i.bak "/$COMMIT_TO_REMOVE/d" "\$FILE"
EDITOR_SCRIPT

chmod +x "$TEMP_EDITOR"

# Use the parent commit to start the rebase
echo "🔄 Running: git rebase -i $COMMIT_BEFORE"
echo "   (Automatically removing commit $COMMIT_TO_REMOVE from the rebase list)"
GIT_SEQUENCE_EDITOR="$TEMP_EDITOR" git rebase -i "$COMMIT_BEFORE"

# Clean up temp file
rm -f "$TEMP_EDITOR"

echo ""
echo "✅ Rebase completed successfully!"
echo ""

echo "📋 Updated commit history (showing last 10 commits):"
git log --oneline -10
echo ""

# Check if remote exists
if git remote | grep -q .; then
    REMOTE=$(git remote | head -1)
    echo "🌐 Remote repository detected: $REMOTE"
    echo ""
    echo "⚠️  WARNING: You need to force push to update the remote repository."
    echo "⚠️  This will overwrite the remote history!"
    echo ""
    read -p "Do you want to force push to $REMOTE? (yes/no) " -r
    echo
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        BRANCH=$(git branch --show-current)
        echo "🚀 Force pushing to $REMOTE/$BRANCH..."
        git push --force "$REMOTE" "$BRANCH"
        echo ""
        echo "✅ Successfully force pushed to remote!"
    else
        echo "⏭️  Skipping force push. You can do it manually later with:"
        echo "   git push --force $REMOTE $BRANCH"
    fi
else
    echo "ℹ️  No remote repository detected. No push needed."
fi

echo ""
echo "✅ Done! Commit $COMMIT_TO_REMOVE has been removed from history."
echo "   Claude should no longer appear as a contributor for this commit."

