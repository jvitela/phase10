#!/bin/bash

cd opt/nodejs
rm -rf node_modules
ln -s ../../package.json package.json
npm install --only=production
rm package.json package-lock.json
