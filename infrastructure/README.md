# Infrastructure

This directory contains infrastructure‑as‑code for deploying the local device farm
and any supporting services. Use Terraform modules under `terraform/` to
provision cloud resources and Kubernetes manifests under `kubernetes/` to deploy
Selenium Grid and Appium to your cluster. Docker definitions for running
services locally go into `docker/`.
