import { vi } from "vitest";

export const useLocalStorage = vi.fn();
export const getFavicon = vi.fn((url: string) => url);
