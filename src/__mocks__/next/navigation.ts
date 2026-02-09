export const useRouter = () => ({
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  refresh: jest.fn(),
});

export const usePathname = () => "/";
export const useSearchParams = () => new URLSearchParams();
