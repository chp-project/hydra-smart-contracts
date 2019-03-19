#!/bin/bash
ganache-cli -p 9545 > /dev/null 2>&1 &

truffle test --network test