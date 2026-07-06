const PHONE_RE = /^\+380\d{9}$/;

function validateName(value) {
  if (!value || value.trim().length < 2) {
    return 'Name must be at least 2 characters.';
  }
  return null;
}

function validatePhone(value) {
  if (!value || !PHONE_RE.test(value.trim())) {
    return 'Phone must be in format +380XXXXXXXXX.';
  }
  return null;
}

function validateCompany(value) {
  if (!value || value.trim().length < 1) {
    return 'Company name cannot be empty.';
  }
  return null;
}

function validateTask(value) {
  if (!value || value.trim().length < 10) {
    return 'Task description must be at least 10 characters.';
  }
  return null;
}

module.exports = { validateName, validatePhone, validateCompany, validateTask };
