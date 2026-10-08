# Docmosis Mailmerge Test App

This app provides a small React-style form and a Node API that sends recipient data to Docmosis. The generated .docx is saved in a named Docker volume and can be downloaded from the browser.

## Prerequisites

- Docker Engine with Compose v2
- A local build of the Docmosis image (the configured Dockerfile downloads the Docmosis runtime and LibreOffice)

## Start

```bash
docker compose up --build
```

Open http://localhost:3000. The sample template is available at `Docmosis/Release/Templates/BusinessLetterTemplate.docx`.

## Docmosis administrator password

The local test password is stored in the root `.env` file. Change it before using the stack outside a test environment. The password is passed to Docmosis as the JVM `adminPw` setting and is not exposed by the App API.

The Docmosis administration interface is available at http://localhost:8080. The default administrator username is `admin`.

## Generated files

Generated documents are stored in the `app-output` named volume. On a Linux host, you can inspect them with:

```bash
docker compose run --rm app sh -c 'find /app/output -maxdepth 1 -type f -print'
```

To recreate the volume and remove generated files:

```bash
docker compose down -v
```

## API

Send a form body to `POST /api/generate`:

```json
{
  "person": {
    "firstName": "John",
    "lastName": "Ramsay",
    "address": {
      "Line1": "417 Honey Close,",
      "Line2": "Sydney, NSW 2002"
    }
  },
  "position": {
    "Num": "1211-3SPM",
    "Title": "Senior Project Manager"
  },
  "acknowledgeDate": "March 12, 2024",
  "numApplications": "57",
  "includeTimeframe": "true",
  "responseDate": "Friday, Apr 10 2024",
  "hrRep": {
    "name": "Julie Partner",
    "Position": "Human Resources Manager"
  },
  "branch": {
    "Addr1": "154-164 The Embarcadero",
    "Addr2": "San Francisco",
    "State": "CA",
    "ZIP": "94105",
    "Phone": "(1) 555-123-1234",
    "Email": "hr@metalegalfinance.com"
  }
}
```

The response includes the generated file name and download URL. Docmosis is available at http://localhost:8080 while the services are running.
