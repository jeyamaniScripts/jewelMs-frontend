// Shared validation patterns — Indian business/identity document formats.
// Centralized so Company and Employee schemas stay consistent.

export const PATTERNS = {
  phone10: /^[0-9]{10}$/,
  pincode: /^[0-9]{6}$/,
  gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  aadhaar: /^[0-9]{12}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  upi: /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/,
};

export const MESSAGES = {
  phone10: "Enter a valid 10-digit phone number",
  pincode: "Enter a valid 6-digit pincode",
  gst: "Enter a valid GST number (e.g. 33ABCDE1234F1Z5)",
  pan: "Enter a valid PAN (e.g. ABCDE1234F)",
  aadhaar: "Enter a valid 12-digit Aadhaar number",
  ifsc: "Enter a valid IFSC code (e.g. HDFC0001234)",
  upi: "Enter a valid UPI ID (e.g. name@bank)",
};
