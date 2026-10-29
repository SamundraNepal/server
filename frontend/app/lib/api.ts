export const API_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_URL
    : process.env.NEXT_PUBLIC_URL!;
    
export async function apiClient(endPoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endPoint}`, {
    ...options,
  });

  const responseResult = await response.json();

  if (!response.ok) {
    return responseResult;
  }

  return responseResult;
}
