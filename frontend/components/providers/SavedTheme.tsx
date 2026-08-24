"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export default function SavedTheme() {
  const { setTheme } = useTheme();

  useEffect(() => {
    async function loadTheme() {
      try {
        const response = await fetch(
          "/api/settings",
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          console.error(
            "Impossible de récupérer les paramètres.",
          );
          return;
        }

        const settings =
          await response.json();

        if (!Array.isArray(settings)) {
          console.error(
            "Format des paramètres invalide.",
          );
          return;
        }

        const themeSetting =
          settings.find(
            (setting) =>
              setting.key === "theme",
          );

        if (
          themeSetting?.value === "dark" ||
          themeSetting?.value === "light"
        ) {
          setTheme(themeSetting.value);

          console.log(
            "THÈME LANDIS :",
            themeSetting.value,
          );
        }
      } catch (error) {
        console.error(
          "Erreur chargement du thème :",
          error,
        );
      }
    }

    loadTheme();
  }, [setTheme]);

  return null;
}