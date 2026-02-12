import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPage from "@/app/settings/page";

const mockSignIn = jest.fn();
const mockSignOut = jest.fn();

let mockAuthValue = {
  user: null as { uid: string; displayName?: string; photoURL?: string; email?: string } | null,
  loading: false,
  familyId: null as string | null,
  babyName: null as string | null,
  signIn: mockSignIn,
  signOut: mockSignOut,
};

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuthValue,
}));

jest.mock("@/lib/firebase-config", () => ({
  isFirebaseConfigured: () => true,
}));

beforeEach(() => {
  mockAuthValue = {
    user: null,
    loading: false,
    familyId: null,
    babyName: null,
    signIn: mockSignIn,
    signOut: mockSignOut,
  };
  mockSignIn.mockReset();
  mockSignOut.mockReset();
});

describe("Settings page - not signed in", () => {
  test("shows sign-in prompt when not signed in", () => {
    render(<SettingsPage />);

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
    expect(
      screen.getByText(/Sign in to create or join a family/)
    ).toBeInTheDocument();
  });

  test("calls signIn when sign-in button is clicked", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByText("Sign in with Google"));
    expect(mockSignIn).toHaveBeenCalled();
  });
});

describe("Settings page - signed in, no family", () => {
  beforeEach(() => {
    mockAuthValue.user = { uid: "user-1", displayName: "Test User" };
  });

  test("shows create and join sections", () => {
    render(<SettingsPage />);

    expect(screen.getByText("Create a family", { selector: "h2" })).toBeInTheDocument();
    expect(screen.getByText("Join a family", { selector: "h2" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Baby's name (optional)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("ABC123")).toBeInTheDocument();
  });

  test("create family button is present", () => {
    render(<SettingsPage />);

    const createButton = screen.getByRole("button", { name: "Create a family" });
    expect(createButton).toBeInTheDocument();
  });

  test("join code input works", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const input = screen.getByPlaceholderText("ABC123");
    await user.type(input, "xyz789");
    expect(input).toHaveValue("XYZ789");
  });

  test("join button is disabled when code is incomplete", () => {
    render(<SettingsPage />);

    const joinButton = screen.getByRole("button", { name: "Join" });
    expect(joinButton).toBeDisabled();
  });
});

describe("Settings page - signed in, in family", () => {
  beforeEach(() => {
    mockAuthValue.user = { uid: "user-1", displayName: "Test User" };
    mockAuthValue.familyId = "family-abc";
    mockAuthValue.babyName = "Luna";
  });

  test("shows family code, baby name input, and leave button", async () => {
    const mockGetFamilyInfo = jest.fn().mockResolvedValue({
      code: "ABC123",
      memberCount: 2,
      babyName: "Luna",
    });

    jest.doMock("@/lib/family", () => ({
      getFamilyInfo: mockGetFamilyInfo,
      getFamilyId: () => "family-abc",
      getBabyName: () => "Luna",
      setBabyName: jest.fn(),
      setFamilyId: jest.fn(),
    }));

    render(<SettingsPage />);

    // Wait for family info to load
    await screen.findByText("ABC123");

    expect(screen.getByText("ABC123")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Luna")).toBeInTheDocument();
    expect(screen.getByText("Leave family")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("leave family shows confirmation", async () => {
    const mockGetFamilyInfo = jest.fn().mockResolvedValue({
      code: "XYZ789",
      memberCount: 1,
      babyName: "Luna",
    });

    jest.doMock("@/lib/family", () => ({
      getFamilyInfo: mockGetFamilyInfo,
      getFamilyId: () => "family-abc",
      getBabyName: () => "Luna",
      setBabyName: jest.fn(),
      setFamilyId: jest.fn(),
    }));

    const user = userEvent.setup();
    render(<SettingsPage />);

    await screen.findByText("Leave family");
    await user.click(screen.getByText("Leave family"));

    expect(screen.getByText("Are you sure? Your local data will be cleared.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Leave" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });
});
