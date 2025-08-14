export const allowedTypes = [
  "image/",
  "audio/",
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/pdf",
  "text/csv",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_SIZE = 85 * 1024 * 1024;

export const uuidV4Regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
