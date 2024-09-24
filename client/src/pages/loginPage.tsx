import classes from "./LoginPage.module.scss";
import { Form, useActionData, redirect, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import apiClient from "../api/client";
import logo from "../../public/logo_vector.svg";

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
    <div className={classes["login-page"]}>
      <div className={classes.header}>
        <div className={classes.logo}>
          <img src={logo} alt="Logo" />
        </div>
        <h1>Twórz spersonalizowane chaty w oparciu o swoje dane</h1>
        <h2>
          Nasza aplikacja automatycznie przekształca Twoje dane w chaty
          dopasowane do Twoich potrzeb
        </h2>
      </div>
      <div className={classes["login-section"]}>
        {actionData?.error && (
          <p style={{ color: "red" }}>{actionData.error}</p>
        )}
        <div className={classes["form-container"]}>
          <h2>Zaloguj się</h2>
          <Form method="post" className={classes.form}>
            <input
              type="text"
              name="username"
              placeholder="Nazwa użytkownika"
              autoComplete="username"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Hasło"
              autoComplete="current-password"
              required
            />
            <button type="submit">Zaloguj</button>
          </Form>
        </div>
      </div>
    </div>
  );
}
