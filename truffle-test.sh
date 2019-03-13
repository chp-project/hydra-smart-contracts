#!/bin/bash
ganache-cli -p 9545 &

truffle test --network test