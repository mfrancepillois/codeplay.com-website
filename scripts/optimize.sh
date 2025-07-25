#!/bin/bash

BUILD_TARGET_DIRECTORY=$1

# Compile any SCSS content in CSS files
find "$BUILD_TARGET_DIRECTORY/assets/css/" -name "*.css" | while read -r file;
do
  echo "[Builder] Compressing CSS/SCSS file $file"
  mv "$file" "$file".scss # sass can only convert .scss files, create a temp file

  if ! npx sass "$file".scss "$file" --style=compressed --no-source-map;
  then
    exit_with_error "[Builder] Filed to compress CSS file '$file', exiting."
  fi

  rm "$file".scss # Delete the temp file
done || exit 1

# Compile any JS files
find "$BUILD_TARGET_DIRECTORY/assets/js/" -type f -name "*.js" ! -name "*.min.js" | while read -r file;
do
  echo "[Builder] Converting JS file $file"
  mv "$file" "$file".temp # temp file as we can't overwrite open file

  if ! npx terser "$file".temp -o "$file" --compress --mangle;
  then
    exit_with_error "[Builder] Filed to compress JS file '$file', exiting."
  fi

  rm "$file".temp # Delete the temp file
done || exit 1
