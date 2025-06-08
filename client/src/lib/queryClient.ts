import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE_URL = 'http://localhost:3001';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(path: string, options: RequestOptions = {}) {
  const { method = 'GET', data } = options;
  
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  console.log(`Making ${method} request to ${url}`);
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    console.log(`Response status:`, response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API request failed:', errorData);
      throw new Error(JSON.stringify(errorData));
    }

    const result = await response.json();
    console.log(`Request to ${url} successful:`, result);
    return result;
  } catch (error) {
    console.error(`API request to ${url} failed:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
