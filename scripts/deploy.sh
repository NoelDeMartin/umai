#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd dist

# prepare github pages
echo "umai.noeldemartin.com" > CNAME
touch .nojekyll

# publish
git init
git checkout -b main
git add -A
git commit -m 'deploy'
git push -f git@github.com:noeldemartin/umai.git main:gh-pages

cd -
