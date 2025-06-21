# GitHub Actions Setup

This document explains how to set up automated testing, building, and deployment
of HomeyScripts using a single GitHub Actions workflow.

## Overview

The repository includes one GitHub Actions workflow:

- **`ci.yml`** - Runs tests, builds the project, and syncs scripts to Homey (on
  main branch merges or manual trigger)

## Workflow Details

### CI/CD Workflow (`ci.yml`)

**Triggers:**

- Push to any branch
- Pull requests to any branch
- Pull request merges to main branch (for sync only)
- Issue comments containing `/hsk sync` (for manual sync)

**Jobs:**

#### 1. Test Job

- Runs on all triggers
- Installs dependencies
- Runs linting and tests

#### 2. Build Job

- Runs on all triggers (after test passes)
- Installs dependencies
- Builds the project using Rolldown
- Uploads build artifacts

#### 3. Sync Job

- Runs when pull requests are merged to main branch OR when `/hsk sync` is
  commented
- Requires successful completion of build job
- Downloads build artifacts (for PR merges) or builds fresh (for manual sync)
- Syncs built scripts to Homey device using CLI flags
- Comments back on PR for manual syncs

#### Workflow Behavior

| Event                   | Test | Build | Sync |
| ----------------------- | ---- | ----- | ---- |
| **Push to any branch**  | ✅   | ✅    | ❌   |
| **PR to any branch**    | ✅   | ✅    | ❌   |
| **PR merged to main**   | ✅   | ✅    | ✅   |
| **Comment `/hsk sync`** | ✅   | ✅    | ✅   |

**Legend:**

- ✅ = Job runs
- ❌ = Job does not run

## Manual Sync

You can trigger a manual sync by commenting `/hsk sync` on any pull request.
This will:

1. Build the project fresh
2. Sync scripts to your Homey device
3. Comment back with success confirmation

## Skip Sync on Merge

You can skip automatic sync when merging a PR by including `/skip-sync` in the
merge commit message.

**How to use:**

1. When merging your PR, add `/skip-sync` to the merge commit message
2. The sync will be skipped automatically

This is useful when you want to merge changes but deploy them later, or when the
changes don't require deployment.

**Example merge commit message:**

```
Merge pull request #123 from feature/new-script

Add new automation script

/skip-sync
```

## Performance Optimizations

The workflow includes npm dependency caching to speed up execution:

- Caches `node_modules` based on `package-lock.json`
- Significantly reduces dependency installation time (typically 60-80% faster)
- Automatically invalidates when `package-lock.json` changes

## Required Setup

You must configure the following secrets in your GitHub repository:

- `HOMEY_IP` - Your Homey device's IP address
- `HOMEY_API_KEY` - Your Homey API key for authentication
- `HOMEY_HTTPS` (optional) - Set to `true` if your Homey uses HTTPS

### Adding Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret with the appropriate name and value
6. Click **Add secret**

## Security Considerations

- **API Key Security:** The API key is stored as a GitHub secret and is
  encrypted
- **Network Access:** Your Homey must be accessible from GitHub Actions runners
  (typically requires port forwarding or VPN)
- **Branch Protection:** The sync job only runs on pull request merges to main
  branch, ensuring code review
- **CLI Flags:** Configuration is passed securely via CLI flags, no
  configuration files are created
- **Manual Sync:** Only works on pull requests, not direct pushes

## Troubleshooting

- Check the GitHub Actions logs for detailed error messages
- Test the sync command locally first: `npx hsk sync`
- Verify your Homey configuration works locally
- Check that your Homey is online and accessible

## Manual Trigger

You can manually trigger the workflow from the GitHub Actions tab if needed.

## Customization

You can add custom steps to the workflow by editing `.github/workflows/ci.yml`.

## Support

If you encounter issues with the GitHub Actions setup:

1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Review the workflow logs for error details
3. Test the commands locally to isolate issues
4. Open an issue in this repository with detailed error information
