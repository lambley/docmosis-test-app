# Docmosis Release Container

This Dockerfile builds the "release" container, based on the "build" container.
This effectively copies the contents of Templates/

On every `master` run, after container release stages finish (success, skip, or fail), the pipeline prunes the `docmosis` repository on `hmctsprivate` and `hmctsprod`, removing tags and untagged manifests older than 365 days (`acr purge --ago 365d`).

Only environments with changed template paths are built (see `ADO/scripts/detect-changed-environments.sh`): per-env folders build that env only; `Templates/Base/`, `Docker/Release/`, or ADO pipeline changes build all environments.
