#!/bin/bash

sudo ln -s /etc/nginx/sites-available/acedemic.studentlife.ulisboa.pt.conf /etc/nginx/sites-enabled/

sudo systemctl reload nginx