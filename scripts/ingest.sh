#!/bin/bash
# Wrapper script to load env variables and run ingest-knowledge.ts

set -a
source .env.local
set +a

npx tsx scripts/ingest-knowledge.ts "$@"
