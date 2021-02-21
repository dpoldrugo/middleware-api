#!/usr/bin/env bash
npm run build
docker build -t middleware-api .
