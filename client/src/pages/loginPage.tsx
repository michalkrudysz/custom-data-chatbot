import classes from "./LoginPage.module.scss";
import { Form, useActionData, redirect, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "../api/client";
import logo from "../../public/logo_vector.svg";
import Footer from "../components/Footer";
import Dialog, { DialogProps } from "../components/Dialog";

import avatarOne from "../assets/avatar_1.webp";
import avatarTwo from "../assets/avatar_2.webp";
import avatarThree from "../assets/avatar_3.webp";
import avatarFour from "../assets/avatar_4.webp";
import avatarFive from "../assets/avatar_5.webp";

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
    return { error: "Nieprawidłowe dane logowania" };
  }
};

export default function LoginPage() {
  const actionData = useActionData() as ActionData;
  const navigate = useNavigate();
  const [error, setError] = useState<string | undefined>(actionData?.error);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (actionData?.error) {
      setError(actionData.error);
    }
  }, [actionData]);

  const handleInputFocus = () => {
    if (error) {
      setError(undefined);
    }
  };

  const dialogOne: DialogProps = {
    imageSrc: avatarOne,
    containerTop: "7rem",
    containerLeft: "9rem",
    backgroundColor: "#b2b3ff",
    color: "#121113",
    width: "15rem",
    content: "Jakie funkcje oferuje ta aplikacja?",
  };

  const dialogTwo: DialogProps = {
    imageSrc: avatarTwo,
    containerTop: "36rem",
    containerLeft: "86rem",
    backgroundColor: "#ffffff",
    color: "#181818",
    width: "16rem",
    content: "Czy mogę korzystać z aplikacji bez dostępu do internetu?",
  };

  const dialogThree: DialogProps = {
    imageSrc: avatarThree,
    containerTop: "49rem",
    containerLeft: "26rem",
    backgroundColor: "#2d4cfa",
    color: "#f8f6f9",
    width: "19rem",
    content: "Jak zaprosić członków zespołu do projektu?",
  };

  const dialogFour: DialogProps = {
    imageSrc: avatarFour,
    containerTop: "9rem",
    containerLeft: "84rem",
    backgroundColor: "#6e40ff",
    color: "#f8f6f9",
    width: "18rem",
    content: "Czy dostępna jest wersja próbna aplikacji?",
  };

  const dialogFive: DialogProps = {
    imageSrc: avatarFive,
    containerTop: "30rem",
    containerLeft: "2rem",
    backgroundColor: "#d87edb",
    color: "#f8f6f9",
    width: "20rem",
    content: "W jakich formatach mogę generować raporty?",
  };

  return (
    <div className={classes["login-page"]}>
      <div className={classes.shadow}></div>
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
        <div className={classes["form-container"]}>
          <h2>Zaloguj się</h2>
          <Form method="post" className={classes.form}>
            <input
              type="text"
              name="username"
              placeholder="Nazwa użytkownika"
              autoComplete="username"
              required
              onFocus={handleInputFocus}
            />
            <input
              type="password"
              name="password"
              placeholder="Hasło"
              autoComplete="current-password"
              required
              onFocus={handleInputFocus}
            />
            <button type="submit">Zaloguj</button>
            {error && <p className={classes.error}>{error}</p>}
          </Form>
        </div>
      </div>
      <Dialog {...dialogOne} />
      <Dialog {...dialogTwo} />
      <Dialog {...dialogThree} />
      <Dialog {...dialogFour} />
      <Dialog {...dialogFive} />
      <Footer />
    </div>
  );
}
