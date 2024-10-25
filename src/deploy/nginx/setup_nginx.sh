#!/bin/bash

sudo cp nginx.conf /etc/nginx/sites-available/academic.studentlife.ulisboa.pt.conf

sudo ln -s /etc/nginx/sites-available/academic.studentlife.ulisboa.pt.conf /etc/nginx/sites-enabled/

sudo systemctl reload nginx
