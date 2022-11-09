#!/bin/sh

bin/membrane_videoroom_demo eval "VideoRoom.Release.migrate"

exec "$@"