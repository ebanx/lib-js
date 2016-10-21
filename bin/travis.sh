#!/usr/bin/env bash

set -e

project_dir(){
  export PROJECT_DIR=$(pwd)
  if [ "$TRAVIS_BUILD_DIR" != "" ]; then
    export PROJECT_DIR=$TRAVIS_BUILD_DIR
  fi
  echo PROJECT_DIR $PROJECT_DIR
}

project_dir

docker build -f travis/Dockerfile -t ebanx/checkout-js .