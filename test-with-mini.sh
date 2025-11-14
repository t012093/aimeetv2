#!/bin/bash
# Temporarily use gpt-4o-mini for testing
export OPENAI_MODEL=gpt-4o-mini
npm run process-meeting -- --bot 9f8194ac-56aa-41b1-b30a-c9f0a86dc4e7 --output meeting.md
