#!/bin/bash
cd /share

sudo chmod 777 /share

slither . --json slither-output.json

exit_status=$?
if [ $exit_status -ne 0 ]; then
    exit 0
fi