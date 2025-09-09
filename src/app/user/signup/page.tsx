// src/app/user/signup/page.tsx
import SignUpFormUI from '@/components/ui/signup-form'; // or wherever you put the component

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <SignUpFormUI />
      </div>
    </main>
  );
}
