const FLAT_REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "company",
  "subject",
  "message",
];

const BUSINESS_LETTER_REQUIRED_FIELDS = [
  "person.firstName",
  "person.lastName",
  "person.address.Line1",
  "person.address.Line2",
  "position.Num",
  "position.Title",
  "acknowledgeDate",
  "numApplications",
  "includeTimeframe",
  "responseDate",
  "hrRep.name",
  "hrRep.Position",
  "branch.Addr1",
  "branch.Addr2",
  "branch.State",
  "branch.ZIP",
  "branch.Phone",
  "branch.Email",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRequiredFields(data) {
  return Object.hasOwn(data, "person.firstName")
    ? BUSINESS_LETTER_REQUIRED_FIELDS
    : FLAT_REQUIRED_FIELDS;
}

export function validateMailmergeData(data) {
  const errors = {};
  const requiredFields = getRequiredFields(data);

  for (const field of requiredFields) {
    const value = data[field];
    const isPresent =
      typeof value === "string" ? value.trim().length > 0 : value === true;
    if (!isPresent) {
      errors[field] = "This field is required.";
    }
  }

  if (data.email && !EMAIL_PATTERN.test(data.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

function setNestedValue(result, path, value) {
  const keys = path.split(".");
  let current = result;

  for (const [index, key] of keys.entries()) {
    if (index === keys.length - 1) {
      current[key] = value;
      return;
    }

    current[key] ??= {};
    current = current[key];
  }
}

export function buildMailmergeData(data) {
  const result = {};

  for (const [path, value] of Object.entries(data)) {
    if (!getRequiredFields(data).includes(path)) {
      continue;
    }

    const normalizedValue = typeof value === "string" ? value.trim() : value;
    setNestedValue(result, path, normalizedValue);
  }

  return result;
}
