#!/bin/bash
ffmpeg -re -i ship.mp4 -c copy -f flv rtmp://localhost/live/ship
