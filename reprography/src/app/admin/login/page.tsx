import { SignIn } from '@clerk/nextjs';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
        <p className="text-muted-foreground">
          Sign in with your admin credentials
        </p>
      </div>
      <SignIn 
        redirectUrl="/admin/dashboard"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg"
          }
        }}
      />
    </div>
  );
}
