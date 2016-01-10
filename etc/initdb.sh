#!/bin/bash
rm -f database.sqlite3
sqlite3 database.sqlite3 < initdb.sql
