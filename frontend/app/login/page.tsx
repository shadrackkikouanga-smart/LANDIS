"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiRequest(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      if (!data?.access_token) {
        throw new Error(
          "Token de connexion absent",
        );
      }

      /*
       * On demande à Next.js de créer
       * les cookies de session.
       */
      const sessionResponse =
        await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            token: data.access_token,
          }),
        });

      if (!sessionResponse.ok) {
        throw new Error(
          "Impossible de créer la session",
        );
      }

      const session =
        await sessionResponse.json();

      console.log(
        "Connexion réussie :",
        session,
      );

      /*
       * Redirection vers le dashboard.
       *
       * Le middleware vérifiera ensuite
       * le token et le rôle.
       */
      router.replace("/dashboard");

      router.refresh();
    } catch (error) {
      console.error(
        "Erreur connexion :",
        error,
      );

      setError(
        "Email ou mot de passe incorrect.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-gray-50
        px-4
      "
    >
      <form
        onSubmit={handleLogin}
        className="
          w-full
          max-w-md
          rounded-xl
          bg-white
          p-8
          shadow
        "
      >
        <h1
          className="
            mb-2
            text-center
            text-2xl
            font-bold
            text-slate-900
          "
        >
          Connexion LANDIS
        </h1>

        <p
          className="
            mb-6
            text-center
            text-sm
            text-slate-500
          "
        >
          Plateforme de gestion de
          lotissement
        </p>

        {error && (
          <div
            className="
              mb-4
              rounded-lg
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-600
            "
          >
            {error}
          </div>
        )}

        <label
          className="
            mb-2
            block
            text-sm
            font-medium
            text-slate-700
          "
        >
          Email
        </label>

        <input
          type="email"
          placeholder="exemple@landis.com"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
          className="
            mb-4
            w-full
            rounded-lg
            border
            border-slate-300
            p-3
            outline-none
            focus:border-slate-900
          "
        />

        <label
          className="
            mb-2
            block
            text-sm
            font-medium
            text-slate-700
          "
        >
          Mot de passe
        </label>

        <input
          type="password"
          placeholder="Votre mot de passe"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
          className="
            mb-6
            w-full
            rounded-lg
            border
            border-slate-300
            p-3
            outline-none
            focus:border-slate-900
          "
        />

        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            rounded-lg
            bg-slate-900
            p-3
            font-medium
            text-white
            transition
            hover:bg-slate-800
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {loading
            ? "Connexion..."
            : "Se connecter"}
        </button>
      </form>
    </div>
  );
}