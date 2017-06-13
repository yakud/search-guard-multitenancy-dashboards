#!/usr/bin/env bash

VERSION="5.4.0-1"
PLUGIN_NAME="search-guard-multitenancy-dashboards"
PLUGIN_ZIP=${PLUGIN_NAME}"-${VERSION}.zip"
FOLDER="kibana/${PLUGIN_NAME}/"
mkdir -p ${FOLDER}

npm run build
mv build/${PLUGIN_ZIP} ${FOLDER} && rm -rf build/
unzip ${FOLDER}/${PLUGIN_ZIP}
mv ${PLUGIN_NAME}-${VERSION}/* ${FOLDER} && rm -rf ${PLUGIN_NAME}-${VERSION}/ && rm ${FOLDER}/${PLUGIN_NAME}"-${VERSION}.zip"
zip -r ${PLUGIN_NAME}"-${VERSION}.zip" kibana/ && rm -rf kibana/
