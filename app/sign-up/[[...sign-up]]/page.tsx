import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp path="/sign-up" afterSignUpUrl="/onboarding" />
    </div>
  );
}