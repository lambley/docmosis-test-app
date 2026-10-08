import test from "node:test";
import assert from "node:assert/strict";

import {
  buildMailmergeData,
  validateMailmergeData,
} from "../src/validation.js";

test("validateMailmergeData accepts a complete form", () => {
  const result = validateMailmergeData({
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    company: "Analytical Engines",
    subject: "Project update",
    message: "Please review the latest delivery.",
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test("validateMailmergeData reports missing and invalid values", () => {
  const result = validateMailmergeData({
    firstName: "",
    lastName: "Lovelace",
    email: "not-an-email",
    company: "",
    subject: "Project update",
    message: "",
  });

  assert.equal(result.valid, false);
  assert.deepEqual(
    new Set(Object.keys(result.errors)),
    new Set(["firstName", "email", "company", "message"]),
  );
});

test("buildMailmergeData trims values for Docmosis", () => {
  const data = buildMailmergeData({
    firstName: "  Ada  ",
    lastName: "  Lovelace ",
    email: " ada@example.com ",
    company: "  Analytical Engines  ",
    subject: "  Project update  ",
    message: "  Please review.  ",
  });

  assert.deepEqual(data, {
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    company: "Analytical Engines",
    subject: "Project update",
    message: "Please review.",
  });
});

test("buildMailmergeData creates the nested business letter structure", () => {
  const data = buildMailmergeData({
    "person.firstName": "  John  ",
    "person.lastName": "  Ramsay  ",
    "person.address.Line1": "  417 Honey Close,  ",
    "person.address.Line2": "  Sydney, NSW 2002  ",
    "position.Num": " 1211-3SPM ",
    "position.Title": "  Senior Project Manager ",
    acknowledgeDate: "  March 12, 2024 ",
    numApplications: " 57 ",
    includeTimeframe: " true ",
    responseDate: "  Friday, Apr 10 2024 ",
    "hrRep.name": "  Julie Partner ",
    "hrRep.Position": "  Human Resources Manager ",
    "branch.Addr1": "  42 Example Street  ",
    "branch.Addr2": "  Sydney NSW 2000  ",
    "branch.State": "  NSW  ",
    "branch.ZIP": "  2000  ",
    "branch.Phone": "  02 5555 0100  ",
    "branch.Email": "  hr@example.com  ",
  });

  assert.deepEqual(data, {
    person: {
      firstName: "John",
      lastName: "Ramsay",
      address: {
        Line1: "417 Honey Close,",
        Line2: "Sydney, NSW 2002",
      },
    },
    position: {
      Num: "1211-3SPM",
      Title: "Senior Project Manager",
    },
    acknowledgeDate: "March 12, 2024",
    numApplications: "57",
    includeTimeframe: "true",
    responseDate: "Friday, Apr 10 2024",
    hrRep: {
      name: "Julie Partner",
      Position: "Human Resources Manager",
    },
    branch: {
      Addr1: "42 Example Street",
      Addr2: "Sydney NSW 2000",
      State: "NSW",
      ZIP: "2000",
      Phone: "02 5555 0100",
      Email: "hr@example.com",
    },
  });
});

test("validateMailmergeData validates the nested business letter fields", () => {
  const result = validateMailmergeData({
    "person.firstName": "John",
    "person.lastName": "Ramsay",
    "person.address.Line1": "417 Honey Close,",
    "person.address.Line2": "Sydney, NSW 2002",
    "position.Num": "1211-3SPM",
    "position.Title": "Senior Project Manager",
    acknowledgeDate: "March 12, 2024",
    numApplications: "57",
    includeTimeframe: true,
    responseDate: "Friday, Apr 10 2024",
    "hrRep.name": "Julie Partner",
    "hrRep.Position": "Human Resources Manager",
    "branch.Addr1": "42 Example Street",
    "branch.Addr2": "Sydney NSW 2000",
    "branch.State": "NSW",
    "branch.ZIP": "2000",
    "branch.Phone": "02 5555 0100",
    "branch.Email": "hr@example.com",
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});
