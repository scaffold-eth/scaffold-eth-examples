#!/bin/bash
ffmpeg -re -i ship.mp4 -c:v libx264 -preset veryfast -tune zerolatency -c:a aac -ar 44100 -f flv rtmp://localhost/live/ship
