import { SignUp } from '@clerk/nextjs';
import { Suspense } from 'react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-sm text-neutral-400 mt-2">Manage your budgets and track expenses with Neon PostgreSQL</p>
        </div>
        <div className="flex justify-center">
          <Suspense fallback={<div className="text-neutral-500 text-sm">Loading sign-up...</div>}>
            <SignUp
              appearance={{
                elements: {
                  rootBox: 'mx-auto',
                  card: 'bg-[#111111] border border-neutral-800 text-white',
                  headerTitle: 'text-white font-semibold',
                  headerSubtitle: 'text-neutral-400',
                  socialButtonsBlockButton: 'bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800',
                  formButtonPrimary: 'bg-white text-black hover:bg-neutral-200 font-medium',
                  formFieldLabel: 'text-neutral-300',
                  formFieldInput: 'bg-neutral-900 border-neutral-800 text-white',
                  footerActionLink: 'text-[#c6f24e] hover:text-[#d7ff6b]',
                },
              }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
