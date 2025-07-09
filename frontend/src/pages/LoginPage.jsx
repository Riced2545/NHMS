import LoginForm from "../components/LoginForm";

export default function LoginPage({ onLogin }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-4">Login</h1>
      <LoginForm onLogin={onLogin} />
    </div>
  );
}
