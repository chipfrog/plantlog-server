#!/bin/bash
docker run -d \
  --name plantlog \
  -p 3000:3000 \
  -v /home/chipfrog/projects/plantlog-server/data:/plantlog/data \
  plantlog