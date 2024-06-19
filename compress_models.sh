#!/bin/bash

# https://github.com/CesiumGS/gltf-pipeline

for model in models/*.glb; 
do
  echo $model
  gltf-pipeline -i "models/$model" -o "models/$model" -d
done
