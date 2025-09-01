#!/usr/bin/env bash
# Wrapper script to run all tests using npm scripts.  Accepts optional
# environment name (dev, staging, prod) which sets TEST_ENVIRONMENT.

set -euo pipefail

ENVIRONMENT=${1:-dev}
export TEST_ENVIRONMENT=$ENVIRONMENT

echo "Running tests in $TEST_ENVIRONMENT environment..."

npm run test

echo "All tests finished."