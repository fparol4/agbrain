# Deploy on one Ubuntu VM

The production stack is intentionally small:

```text
Internet -> Caddy + React -> Nest API -> PostgreSQL
             :80/:443       private      persistent volume
```

Caddy serves the built client and proxies `/api` on the same origin. Only the
client publishes public ports. API and PostgreSQL diagnostic ports bind to
`127.0.0.1`, so they are not reachable from the internet.

## 1. Prepare the VM

Use Ubuntu Minimal and install Docker Engine with the Compose plugin using the
[official Ubuntu instructions](https://docs.docker.com/engine/install/ubuntu/).
Clone this repository on the VM.

In the Oracle Cloud network security group or subnet security list, allow:

- TCP 22 from your own IP for SSH.
- TCP 80 and 443 from `0.0.0.0/0` for the application and certificates.
- UDP 443 from `0.0.0.0/0` for HTTP/3 (optional).

Do not open ports 3334 or 5433 in Oracle Cloud or the operating-system firewall.

## 2. Configure

```bash
cp .env.example .env
openssl rand -hex 32
nano .env
```

Use the generated value for `DB_PASSWORD` and choose a separate strong
`ADMIN_PASSWORD`.

To start with only the VM public IP:

```dotenv
APP_ADDRESS=:80
APP_URL=http://203.0.113.10
SESSION_SECURE_COOKIE=false
```

For the recommended HTTPS setup, point a DNS `A` record at the VM and use:

```dotenv
APP_ADDRESS=agbrain.example.com
APP_URL=https://agbrain.example.com
SESSION_SECURE_COOKIE=true
```

Caddy obtains and renews the certificate automatically. The configured admin
is created by the first successful seed; changing its password in `.env` later
does not rewrite an existing account.

## 3. Start and verify

```bash
docker compose config
docker compose up -d --build
docker compose ps
curl --fail "${APP_URL}/health"
```

All three services should become `healthy`. Migrations and the idempotent seed
finish before the API accepts traffic.

## Operations

Deploy the latest checked-out code:

```bash
docker compose build --pull
docker compose up -d --remove-orphans
docker image prune -f
```

Inspect status and logs:

```bash
docker compose ps
docker compose logs --tail=200 api client postgres
```

Create a PostgreSQL backup in the current directory:

```bash
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > "agbrain-$(date +%F).sql"
```

`docker compose down` keeps database and certificate volumes. Never add `-v`
unless permanent data deletion is intentional and a verified backup exists.
