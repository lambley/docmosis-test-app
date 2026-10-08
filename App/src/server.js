import express from "express";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildMailmergeData, validateMailmergeData } from "./validation.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT ?? 3000);
const docmosisUrl = process.env.DOCMOSIS_URL ?? "http://docmosis:8080";
const defaultTemplateName =
  process.env.DOCMOSIS_TEMPLATE ?? "mailmerge-template.docx";
const outputDirectory = process.env.OUTPUT_DIRECTORY ?? "/app/output";
const availableTemplates = new Set([
  "mailmerge-template.docx",
  "BusinessLetterTemplate.docx",
]);

await mkdir(outputDirectory, { recursive: true });

app.use(express.json({ limit: "16kb" }));
app.use(express.static(join(__dirname, "public")));

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    docmosisUrl,
    templateName: defaultTemplateName,
    availableTemplates: [...availableTemplates],
  });
});

app.post("/api/generate", async (request, response) => {
  const validation = validateMailmergeData(request.body ?? {});

  if (!validation.valid) {
    return response.status(400).json({
      error: "Please correct the highlighted fields.",
      errors: validation.errors,
    });
  }

  const templateName = availableTemplates.has(request.body.template)
    ? request.body.template
    : defaultTemplateName;
  const data = buildMailmergeData(request.body);
  const person = data.person ?? data;
  const outputName = `${person.lastName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${person.firstName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-letter.docx`;
  const outputPath = join(outputDirectory, outputName);

  try {
    const docmosisResponse = await fetch(`${docmosisUrl}/api/render`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        templateName,
        outputName,
        data,
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!docmosisResponse.ok) {
      const errorText = await docmosisResponse.text();
      console.error(
        "Docmosis request failed:",
        docmosisResponse.status,
        errorText,
      );
      return response.status(docmosisResponse.status).json({
        error: "Docmosis could not generate the document.",
      });
    }

    const document = Buffer.from(await docmosisResponse.arrayBuffer());
    await import("node:fs/promises").then(({ writeFile }) =>
      writeFile(outputPath, document),
    );

    return response.json({
      fileName: outputName,
      fileUrl: `/downloads/${encodeURIComponent(outputName)}`,
      size: document.length,
    });
  } catch (error) {
    console.error("Docmosis request error:", error);
    return response.status(502).json({
      error:
        "Unable to reach Docmosis. Check that the docmosis service is running.",
    });
  }
});

app.get("/downloads/:fileName", async (request, response) => {
  const fileName = request.params.fileName;
  if (!/^[a-z0-9-]+\.docx$/.test(fileName)) {
    return response.status(400).send("Invalid file name.");
  }

  try {
    const document = await import("node:fs/promises").then(({ readFile }) =>
      readFile(join(outputDirectory, fileName)),
    );
    response.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    response.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`,
    );
    return response.send(document);
  } catch {
    return response.status(404).send("Generated document not found.");
  }
});

app.listen(port, () => {
  console.log(`Mailmerge App listening on http://localhost:${port}`);
});
