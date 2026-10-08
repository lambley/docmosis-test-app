const form = document.querySelector("#letter-form");
const status = document.querySelector("#form-message");
const result = document.querySelector("#result");
const resultMessage = document.querySelector("#result-message");
const downloadLink = document.querySelector("#download-link");
const submitButton = form.querySelector('button[type="submit"]');

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  result.hidden = true;
  status.textContent = "";

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.template = "BusinessLetterTemplate.docx";
  payload.includeTimeframe = formData.get("includeTimeframe") === "true";
  submitButton.disabled = true;
  submitButton.textContent = "Generating document…";

  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await response.json();
  submitButton.disabled = false;
  submitButton.textContent = "Generate Word document →";

  if (!response.ok) {
    status.textContent = body.error ?? "The document could not be generated.";
    for (const [field, message] of Object.entries(body.errors ?? {})) {
      const input = form.elements.namedItem(field);
      input.classList.add("invalid");
      input.setAttribute("aria-invalid", "true");
      const existing = input.parentElement.querySelector(".error-text");
      if (existing) existing.remove();
      input.insertAdjacentHTML(
        "afterend",
        `<span class="error-text">${message}</span>`,
      );
    }
    return;
  }

  downloadLink.href = body.fileUrl;
  downloadLink.download = body.fileName;
  resultMessage.textContent = `${body.fileName} was generated successfully (${(body.size / 1024).toFixed(1)} KB).`;
  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "center" });
});

form.addEventListener("input", (event) => {
  const input = event.target;
  input.classList.remove("invalid");
  input.removeAttribute("aria-invalid");
  input.parentElement.querySelector(".error-text")?.remove();
});
