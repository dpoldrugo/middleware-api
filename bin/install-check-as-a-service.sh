#!/usr/bin/env bash
cp potres-middleware-api-status-check.sh /usr/bin/potres-middleware-api-status-check.sh
cp potres-middleware-api-status-check.service /lib/systemd/system/
cp potres-middleware-api-status-check.service /etc/systemd/system/
chmod 644 /etc/systemd/system/potres-middleware-api-status-check.service
systemctl status potres-middleware-api-status-check
systemctl enable potres-middleware-api-status-check
systemctl status potres-middleware-api-status-check