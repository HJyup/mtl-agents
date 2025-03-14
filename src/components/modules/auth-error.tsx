import { signOut } from "next-auth/react";
import { Button } from "../ui/button";

const AuthError = ({ authError }: { authError: string }) => (
  <div className="flex min-h-screen flex-col items-center justify-center p-4">
    <div className="w-full max-w-md space-y-8 rounded-xl border p-8 text-center shadow-md">
      <h2 className="mb-4 text-xl font-semibold text-red-600">
        Authentication Error
      </h2>
      <p className="mb-6">{authError}</p>
      <Button
        onClick={() => signOut({ callbackUrl: "/auth/signin" })}
        className="w-full"
      >
        Sign out and try again
      </Button>
    </div>
  </div>
);

export default AuthError;
