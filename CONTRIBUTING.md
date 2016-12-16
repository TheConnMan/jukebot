Contributing to Jukebot
==========================================
Contributions are welcome and can be represented in many different ways as noted below. Help is
greatly appreciated and credit will always be given.


Types of Contributions
------------------------------

### Reporting Bugs
Report bugs on [the issues page](https://github.com/TheConnMan/jukebot/issues).
With your bug report, please include:
- Your browser type and version.
- Any details about your local setup that might be helpful in troubleshooting the issue.
- Detailed steps to reproduce the bug.

### Fixing bugs
Find bugs at [the issues page](https://github.com/TheConnMan/jukebot/issues). Anything tagged with
"bug" is open to be fixed.
With your fix, please include:
- The issue number
- A detailed commit message

### Implementing Features
Find features at [the issues page](https://github.com/TheConnMan/jukebot/issues). Anything tagged
with "feature" is open to be implemented.
With your feature, please include:
- The issue number
- A detailed commit message

### Writing Documentation
Jukebot can always use documentation (more documentation is always better!).
Please document your features or usage as part of the official docs, in docstrings,
in blog posts, articles, or wherever you see fit.

### Submitting Feedback
File an issue at [the issues page](https://github.com/TheConnMan/jukebot/issues).
If you are proposing a feature:
- Explain how it would work in detail
- Keep the scope as narrow as possible to make it easier to implement

Workflow for contributing
------------------------------

1. Create a branch directly in this repo or a fork (if you don't have push access). Please name
branches within this repository `feature/<description>` or `fix/description`. For example,
something like `feature/emoji_replacement`.

1. Create an issue or open a pull request (PR). If you aren't sure your PR will solve the issue
or may be controversial, we're okay with you opening an issue separately and linking to it in
your PR. That way, if the PR is not accepted, the issue will remain and be tracked.

1. Clone the fork/branch locally.

1. Close (and reference) issues by the `closes #XXX` or `fixes #XXX` notation in the commit
message. Please use a descriptive, useful commit message that could be used to understand why a
particular change was made.

1. Keep pushing commits to the initial branch using `--amend`/`--rebase` as necessary. Don't mix
unrelated issues in a single branch.

1. Clean up the branch (rebase with master to synchronize, squash, edit commits, test, etc.) to
prepare for it to be merged.

1. If you didn't open a pull request already, do so now.

1. After reviewing your commits for documentation, passed continuous integration (CI) tests,
version bumps, changelogs, and good, descriptive commit messages, a project maintainer can merge your request.

1. Create/update the changelog if necessary.

Releasing
------------------------------
### What we do now


### Future considerations
1. Ensure that version has been bumped with semantic versioning

1. Ensure that the CHANGELOG has been updated

1. Create a git tag for the version

1. Create/update the changelog if necessary. We should consider using the [github-changelog-generator](https://github.com/skywinder/github-changelog-generator) project.
