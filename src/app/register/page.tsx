import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center py-20">
        <RegisterForm />
      </main>

      <Footer />
    </div>
  );
}
