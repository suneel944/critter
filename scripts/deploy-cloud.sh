#!/usr/bin/env bash
# One‑click deployment script to provision infrastructure in a cloud provider
# using Terraform.  You must have Terraform installed and configured with
# credentials for your provider.  Customize variables and backend settings as
# needed.

set -euo pipefail

pushd infrastructure/terraform
echo "Initializing Terraform..."
terraform init

echo "Applying Terraform plan..."
terraform apply -auto-approve
popd

echo "Cloud deployment complete."