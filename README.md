# Docmosis Mailmerge Test App

A Docker Compose application that collects business-letter details, sends them to Docmosis Tornado, and downloads the generated Word document.

## Prerequisites

- Docker Engine with Docker Compose v2
- Docker daemon running
- A valid Docmosis license key
- A Docmosis administrator password
- Internet access for the initial image builds

The stack builds Docmosis Tornado 2.11.4 with LibreOffice 7.5.9.2 and the Node.js application.

## Launch the app

From the repository root, create a local environment file:

```bash
cat > .env <<'EOF'
DOCMOSIS_KEY=your-docmosis-license-key
DOCMOSIS_SITE=your-site-name
DOCMOSIS_ADMINPW=replace-with-a-strong-password
EOF
```

Replace the placeholders with your Docmosis credentials, then start the stack:

```bash
docker compose up --build
```

The application is available at:

- Web interface: http://localhost:3000
- Docmosis API: http://localhost:8080
- Docmosis administration interface: http://localhost:8080/console

The `app` service waits for Docmosis to pass its health check before starting.

To run in the background:

```bash
docker compose up --build -d
```

To stop the stack:

```bash
docker compose down
```

To stop the stack and remove generated documents:

```bash
docker compose down -v
```

## Required environment variables

The following variables are read by `docker-compose.yml` through the Compose `.env` file.

| Variable           | Required | Description                                                             |
| ------------------ | -------- | ----------------------------------------------------------------------- |
| `DOCMOSIS_KEY`     | Yes      | Docmosis license key. The key is passed to the Docmosis service.        |
| `DOCMOSIS_SITE`    | Yes      | Docmosis site name used by the Tornado installation.                    |
| `DOCMOSIS_ADMINPW` | Yes      | Administrator password for the Docmosis console. Use a strong password. |

The following variables are set by Compose and do not need to be added to `.env`:

| Variable                | Value                     | Description                                                                             |
| ----------------------- | ------------------------- | --------------------------------------------------------------------------------------- |
| `DOCMOSIS_OFFICEDIR`    | `/opt/libreoffice`        | LibreOffice installation directory.                                                     |
| `DOCMOSIS_TEMPLATESDIR` | `templates`               | Directory containing the mounted templates.                                             |
| `DOCMOSIS_WORKINGDIR`   | `workingarea`             | Docmosis writable working directory.                                                    |
| `DOCMOSIS_URL`          | `http://docmosis:8080`    | URL used by the Node.js application to call Docmosis.                                   |
| `DOCMOSIS_TEMPLATE`     | `mailmerge-template.docx` | Default template used by the app. The form currently uses the business-letter template. |
| `OUTPUT_DIRECTORY`      | `/app/output`             | Directory where generated Word documents are written.                                   |
| `LANG`                  | `C.UTF-8`                 | Locale used by the Docmosis container.                                                  |

## Environment example

Create `.env` with the following values, replacing the placeholders:

```dotenv
DOCMOSIS_KEY=your-docmosis-license-key
DOCMOSIS_SITE=your-site-name
DOCMOSIS_ADMINPW=replace-with-a-strong-password
```

> Do not commit `.env`. It contains credentials and should remain local.

## Templates

The templates are mounted read-only from `Docmosis/Release/Templates` into the Docmosis container. The current business-letter template is:

```text
Docmosis/Release/Templates/BusinessLetterTemplate.docx
```

The application controls the template used for each request. The current form always generates the business-letter template.

## Generated documents

Generated documents are stored in the `app-output` named Docker volume. To inspect them from the host:

```bash
docker compose run --rm app sh -c 'find /app/output -maxdepth 1 -type f -print'
```

## Development

Run the application tests:

```bash
npm test --prefix App
```

Rebuild only the application image:

```bash
docker compose build app
```

Restart the existing stack after rebuilding:

```bash
docker compose up -d --force-recreate app
```

## API

The application exposes `POST /api/generate`. It accepts the nested business-letter fields and returns the generated file name and download URL.

See [App/README.md](App/README.md) for the application API and field structure.
