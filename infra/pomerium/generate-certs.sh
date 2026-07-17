#!/usr/bin/env bash
# Generates a local CA plus a server cert (for Pomerium's own HTTPS listener) and a client cert
# (for the Adaptive Health backend to present via mTLS) — no identity provider involved.
set -euo pipefail
cd "$(dirname "$0")"

mkdir -p certs
cd certs

openssl genrsa -out ca.key 2048
openssl req -new -x509 -days 825 -key ca.key -out ca.crt -subj "/CN=AdaptiveHealth-Demo-CA"

cat > server.ext << 'EOF'
subjectAltName = DNS:localhost,DNS:adaptive-health-actions.localhost.pomerium.io,IP:127.0.0.1
EOF
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr -subj "/CN=localhost"
openssl x509 -req -days 825 -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -extfile server.ext

openssl genrsa -out client.key 2048
openssl req -new -key client.key -out client.csr -subj "/CN=adaptive-health-agent"
openssl x509 -req -days 825 -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out client.crt

openssl verify -CAfile ca.crt server.crt
openssl verify -CAfile ca.crt client.crt

echo "Certs written to $(pwd)"
