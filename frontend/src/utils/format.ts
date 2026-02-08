export const getImageUrl = (path?: string | null): string => {
  if (!path) return "";

  if (path.startsWith("http")) return path;

  const baseUrl = import.meta.env.VITE_UPLOAD_URL || "http://localhost:5000";

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
};
