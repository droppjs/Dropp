# Security Policy

## Supported Versions

At the moment, only the latest release is actively supported with security fixes.

## Reporting a Vulnerability

Please do not open public issues for security vulnerabilities.

Instead, report privately to the maintainer:

- Maintainer: Ribal Arshad
- Contact: create a private security advisory in GitHub for this repository

When reporting, include:

- A clear description of the issue
- Steps to reproduce
- Impact assessment
- Suggested fix (if available)

## Security Practices Used

- Release publishing is done through GitHub Actions with scoped permissions
- npm authentication uses repository secrets
- Package publish payloads are restricted via `files` in package manifests
- Sensitive/local files are excluded through `.gitignore`

## Recommended Repository Protection Settings

Apply these in GitHub settings:

1. Branch protection on `main`
   - Require pull request before merging
   - Require status checks to pass
   - Restrict who can push to `main`
   - Include administrators
2. Require 2FA for organization/account if applicable
3. Enable Dependabot alerts and security updates
4. Enable secret scanning and push protection
5. Enable signed commits (recommended)

## Note on Public Repositories

Public repositories can be forked by design on GitHub. To fully prevent forking, use a private repository.
