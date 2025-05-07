#!/bin/bash

API_URL="http://localhost:3000/api"
REQUESTS=10  # Number of requests to send

echo "Starting rate limit test - sending $REQUESTS requests to $API_URL"

for i in $(seq 1 $REQUESTS); do
  echo "Request $i:"
  curl -s -w "\nStatus Code: %{http_code}\n" "$API_URL"
  echo "-----------------------------------"
  # Optional small delay between requests
  sleep 0.1
done

echo "Test completed."