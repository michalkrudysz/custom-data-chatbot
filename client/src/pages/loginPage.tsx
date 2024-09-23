import { Form, useActionData, redirect, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import apiClient from "../api/client";

type ActionData = {
  error?: string;
};

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  try {
    const response = await apiClient.post("/auth/login", {
      username,
      password,
    });
    const data = response.data;
    localStorage.setItem("token", data.token);
    return redirect("/");
  } catch (error: any) {
    return { error: "Nieprawidłowe dane logowania." };
  }
};

export default function LoginPage() {
  const actionData = useActionData() as ActionData;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="login-page">
      <h1>Logowanie</h1>
      {actionData?.error && <p style={{ color: "red" }}>{actionData.error}</p>}
      <Form method="post">
        <input
          type="text"
          name="username"
          placeholder="Nazwa użytkownika"
          autoComplete="username"
        />
        <input
          type="password"
          name="password"
          placeholder="Hasło"
          autoComplete="current-password"
        />
        <button type="submit">Zaloguj</button>
      </Form>
    </div>
  );
}
