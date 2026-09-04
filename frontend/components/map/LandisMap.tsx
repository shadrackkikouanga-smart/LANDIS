"use client";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

/* =========================================================
   TYPES
========================================================= */

interface Terrain {
  id: number;
  reference: string;
  nom: string;
  superficie: number;
  localisation?: string | null;
  statut: string;
  latitude?: number | null;
  longitude?: number | null;
  projectId: number;
}

interface Bloc {
  id: number;
  reference: string;
  nombreParcelles: number;
  terrainId: number;
  superficie: number;
  latitude?: number | null;
  longitude?: number | null;
}

interface Parcelle {
  id: number;
  reference: string;
  numero: string;
  superficie: number;
  statut: string;
  latitude?: number | null;
  longitude?: number | null;

  bloc?: {
    id: number;
    reference: string;
    nombreParcelles: number;
    superficie: number;
  } | null;

  proprietaire?: {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
    email?: string | null;
  } | null;
}

interface Coordonnees {
  latitude: number;
  longitude: number;
}

/* =========================================================
   VALIDATION DES COORDONNÉES
========================================================= */

function hasValidCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): latitude is number {
  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude)
  );
}

function hasValidGeoCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): boolean {
  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Retourne des coordonnées garanties comme étant
 * valides pour Leaflet.
 *
 * Cette fonction permet également à TypeScript
 * de comprendre que les deux valeurs sont
 * obligatoirement des nombres après vérification.
 */
function getValidGeoCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): Coordonnees | null {
  if (
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    typeof longitude !== "number" ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}

/* =========================================================
   CENTRAGE AUTOMATIQUE DE LA CARTE
========================================================= */

function MapCenter({
  latitude,
  longitude,
  zoom = 16,
}: {
  latitude: number;
  longitude: number;
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (
      !hasValidGeoCoordinates(
        latitude,
        longitude,
      )
    ) {
      return;
    }

    map.flyTo(
      [latitude, longitude],
      zoom,
      {
        duration: 1,
      },
    );
  }, [
    latitude,
    longitude,
    zoom,
    map,
  ]);

  return null;
}

/* =========================================================
   COMPOSANT PRINCIPAL
========================================================= */

export default function LandisMap() {
  // ========================================================
  // DONNÉES
  // ========================================================

  const [terrains, setTerrains] =
    useState<Terrain[]>([]);

  const [blocs, setBlocs] =
    useState<Bloc[]>([]);

  const [parcelles, setParcelles] =
    useState<Parcelle[]>([]);

  // ========================================================
  // CHARGEMENT
  // ========================================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ========================================================
  // RECHERCHE
  // ========================================================

  const [searchValue, setSearchValue] =
    useState("");

  const [searchMessage, setSearchMessage] =
    useState("");

  const [
    searchMessageType,
    setSearchMessageType,
  ] = useState<
    "success" | "warning" | "error" | ""
  >("");

  const [
    searchedParcelleCenter,
    setSearchedParcelleCenter,
  ] = useState<Coordonnees | null>(null);

  // ========================================================
  // CALQUES
  // ========================================================

  const [showTerrains, setShowTerrains] =
    useState(true);

  const [showBlocs, setShowBlocs] =
    useState(true);

  const [showParcelles, setShowParcelles] =
    useState(true);

  const [showLayers, setShowLayers] =
    useState(false);

  // ========================================================
  // BLOC SÉLECTIONNÉ
  // ========================================================

  const [selectedBlocId, setSelectedBlocId] =
    useState<number | null>(null);

  const [
    selectedBlocCenter,
    setSelectedBlocCenter,
  ] = useState<Coordonnees | null>(null);

  // ========================================================
  // CHARGEMENT DES DONNÉES
  // ========================================================

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [
          terrainsResponse,
          blocsResponse,
          parcellesResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/terrains`),
          fetch(`${API_URL}/blocs`),
          fetch(`${API_URL}/parcelles`),
        ]);

        if (!terrainsResponse.ok) {
          throw new Error(
            "Impossible de récupérer les terrains.",
          );
        }

        if (!blocsResponse.ok) {
          throw new Error(
            "Impossible de récupérer les blocs.",
          );
        }

        if (!parcellesResponse.ok) {
          throw new Error(
            "Impossible de récupérer les parcelles.",
          );
        }

        const terrainsData =
          await terrainsResponse.json();

        const blocsData =
          await blocsResponse.json();

        const parcellesData =
          await parcellesResponse.json();

        setTerrains(
          Array.isArray(terrainsData)
            ? terrainsData
            : [],
        );

        setBlocs(
          Array.isArray(blocsData)
            ? blocsData
            : [],
        );

        setParcelles(
          Array.isArray(parcellesData)
            ? parcellesData
            : [],
        );
      } catch (err) {
        console.error(
          "Erreur chargement carte :",
          err,
        );

        setError(
          "Impossible de charger les données de la carte.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // ========================================================
  // COORDONNÉES VALIDES
  // ========================================================

  const terrainsAvecCoordonnees =
    terrains.filter((terrain) =>
      hasValidGeoCoordinates(
        terrain.latitude,
        terrain.longitude,
      ),
    );

  const blocsAvecCoordonnees =
    blocs.filter((bloc) =>
      hasValidGeoCoordinates(
        bloc.latitude,
        bloc.longitude,
      ),
    );

  const parcellesAvecCoordonnees =
    parcelles.filter((parcelle) =>
      hasValidGeoCoordinates(
        parcelle.latitude,
        parcelle.longitude,
      ),
    );

  // ========================================================
  // RECHERCHE PARCELLE
  // ========================================================

  function handleSearch() {
    const recherche =
      searchValue.trim().toLowerCase();

    if (!recherche) {
      setSearchMessage(
        "Veuillez saisir le numéro ou la référence d'une parcelle.",
      );

      setSearchMessageType("warning");

      return;
    }

    const parcelleTrouvee =
      parcelles.find(
        (parcelle) =>
          parcelle.numero
            .toLowerCase() === recherche ||
          parcelle.reference
            .toLowerCase() === recherche,
      );

    if (!parcelleTrouvee) {
      setSearchMessage(
        `La parcelle "${searchValue}" n'existe pas dans LANDIS.`,
      );

      setSearchMessageType("error");

      setSearchedParcelleCenter(null);

      return;
    }

    const coordinates =
      getValidGeoCoordinates(
        parcelleTrouvee.latitude,
        parcelleTrouvee.longitude,
      );

    if (!coordinates) {
      setSearchMessage(
        `La parcelle ${parcelleTrouvee.reference} existe, mais elle ne possède pas encore de coordonnées géographiques valides.`,
      );

      setSearchMessageType("warning");

      setSearchedParcelleCenter(null);

      return;
    }

    setSearchMessage(
      `Parcelle ${parcelleTrouvee.reference} trouvée.`,
    );

    setSearchMessageType("success");

    setSearchedParcelleCenter(
      coordinates,
    );

    setSelectedBlocId(null);
    setSelectedBlocCenter(null);
  }

  // ========================================================
  // RECHERCHE AVEC ENTER
  // ========================================================

  function handleSearchKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  // ========================================================
  // BLOC SÉLECTIONNÉ
  // ========================================================

  const blocSelectionne =
    selectedBlocId !== null
      ? blocs.find(
          (bloc) =>
            bloc.id === selectedBlocId,
        )
      : null;

  const parcellesDuBlocSelectionne =
    selectedBlocId !== null
      ? parcellesAvecCoordonnees.filter(
          (parcelle) =>
            parcelle.bloc?.id ===
            selectedBlocId,
        )
      : [];

  // ========================================================
  // SÉLECTION DU BLOC
  // ========================================================

  function handleSelectBloc(
    bloc: Bloc,
  ) {
    setSelectedBlocId(bloc.id);

    setSearchMessage("");
    setSearchMessageType("");

    setSearchedParcelleCenter(null);

    const coordinates =
      getValidGeoCoordinates(
        bloc.latitude,
        bloc.longitude,
      );

    if (coordinates) {
      setSelectedBlocCenter(
        coordinates,
      );
    } else {
      setSelectedBlocCenter(null);
    }
  }

  // ========================================================
  // ANNULER SÉLECTION BLOC
  // ========================================================

  function handleClearBlocSelection() {
    setSelectedBlocId(null);
    setSelectedBlocCenter(null);
  }

  // ========================================================
  // RENDU
  // ========================================================

  return (
    <div className="space-y-3">
      {/* ==================================================
          INFORMATIONS
      ================================================== */}

      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
        {loading && (
          <p className="text-slate-500">
            Chargement des données cartographiques...
          </p>
        )}

        {!loading && error && (
          <p className="text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span className="text-slate-600">
              <strong className="text-slate-900">
                {terrainsAvecCoordonnees.length}
              </strong>{" "}
              terrain
              {terrainsAvecCoordonnees.length !== 1
                ? "s"
                : ""}{" "}
              affiché
              {terrainsAvecCoordonnees.length !== 1
                ? "s"
                : ""}
            </span>

            <span className="text-slate-600">
              <strong className="text-slate-900">
                {blocsAvecCoordonnees.length}
              </strong>{" "}
              bloc
              {blocsAvecCoordonnees.length !== 1
                ? "s"
                : ""}{" "}
              affiché
              {blocsAvecCoordonnees.length !== 1
                ? "s"
                : ""}
            </span>

            <span className="text-slate-600">
              <strong className="text-slate-900">
                {parcellesAvecCoordonnees.length}
              </strong>{" "}
              parcelle
              {parcellesAvecCoordonnees.length !== 1
                ? "s"
                : ""}{" "}
              affichée
              {parcellesAvecCoordonnees.length !== 1
                ? "s"
                : ""}
            </span>
          </div>
        )}
      </div>

      {/* ==================================================
          BARRE RECHERCHE + CALQUES
      ================================================== */}

      <div className="relative">
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex w-full gap-2 md:max-w-xl">
            <input
              type="text"
              value={searchValue}
              onChange={(event) =>
                setSearchValue(
                  event.target.value,
                )
              }
              onKeyDown={
                handleSearchKeyDown
              }
              placeholder="Rechercher une parcelle par son numéro ou sa référence..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            />

            <button
              type="button"
              onClick={handleSearch}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Rechercher
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowLayers(
                (value) => !value,
              )
            }
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            🗂️ Calques
          </button>
        </div>

        {/* MESSAGE RECHERCHE */}

        {searchMessage && (
          <div
            className={`mt-2 rounded-lg border px-4 py-3 text-sm ${
              searchMessageType ===
              "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : searchMessageType ===
                  "warning"
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {searchMessage}
          </div>
        )}

        {/* PANNEAU CALQUES */}

        {showLayers && (
          <div className="absolute right-0 top-[76px] z-[1000] w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Affichage de la carte
            </h3>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={showTerrains}
                onChange={(event) =>
                  setShowTerrains(
                    event.target.checked,
                  )
                }
                className="h-4 w-4"
              />

              <span className="h-3 w-3 rounded-full bg-blue-600" />

              <span className="text-sm text-slate-700">
                Terrains
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={showBlocs}
                onChange={(event) =>
                  setShowBlocs(
                    event.target.checked,
                  )
                }
                className="h-4 w-4"
              />

              <span className="h-3 w-3 rounded-full bg-yellow-500" />

              <span className="text-sm text-slate-700">
                Blocs
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={showParcelles}
                onChange={(event) =>
                  setShowParcelles(
                    event.target.checked,
                  )
                }
                className="h-4 w-4"
              />

              <span className="h-3 w-3 rounded-full bg-green-500" />

              <span className="text-sm text-slate-700">
                Parcelles
              </span>
            </label>
          </div>
        )}
      </div>

      {/* ==================================================
          BLOC SÉLECTIONNÉ
      ================================================== */}

      {selectedBlocId !== null &&
        blocSelectionne && (
          <div className="flex flex-col gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900 md:flex-row md:items-center md:justify-between">
            <div>
              <strong>
                {blocSelectionne.reference}
              </strong>

              {" — "}

              {
                parcellesDuBlocSelectionne.length
              }{" "}
              parcelle
              {parcellesDuBlocSelectionne.length !==
              1
                ? "s"
                : ""}{" "}
              avec coordonnées
            </div>

            <button
              type="button"
              onClick={
                handleClearBlocSelection
              }
              className="rounded-lg border border-yellow-300 bg-white px-3 py-2 text-xs font-medium text-yellow-900 hover:bg-yellow-100"
            >
              Afficher toutes les parcelles
            </button>
          </div>
        )}

      {/* ==================================================
          CARTE
      ================================================== */}

      <div className="h-[600px] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <MapContainer
          center={[-4.7692, 11.8667]}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* CENTRAGE RECHERCHE PARCELLE */}

          {searchedParcelleCenter && (
            <MapCenter
              latitude={
                searchedParcelleCenter.latitude
              }
              longitude={
                searchedParcelleCenter.longitude
              }
              zoom={17}
            />
          )}

          {/* CENTRAGE SUR LE BLOC */}

          {selectedBlocCenter && (
            <MapCenter
              latitude={
                selectedBlocCenter.latitude
              }
              longitude={
                selectedBlocCenter.longitude
              }
              zoom={16}
            />
          )}

          {/* ==================================================
              TERRAINS
          ================================================== */}

          {showTerrains &&
            terrainsAvecCoordonnees.map(
              (terrain) => {
                const coordinates =
                  getValidGeoCoordinates(
                    terrain.latitude,
                    terrain.longitude,
                  );

                if (!coordinates) {
                  return null;
                }

                return (
                  <CircleMarker
                    key={`terrain-${terrain.id}`}
                    center={[
                      coordinates.latitude,
                      coordinates.longitude,
                    ]}
                    radius={18}
                    pathOptions={{
                      fillColor: "#2563eb",
                      color: "#ffffff",
                      weight: 3,
                      fillOpacity: 0.35,
                    }}
                  >
                    <Popup>
                      <div className="min-w-[240px]">
                        <h3 className="text-base font-bold text-blue-700">
                          Terrain
                        </h3>

                        <div className="mt-3 space-y-1.5 text-sm">
                          <p>
                            <strong>
                              Référence :
                            </strong>{" "}
                            {terrain.reference}
                          </p>

                          <p>
                            <strong>
                              Nom :
                            </strong>{" "}
                            {terrain.nom}
                          </p>

                          <p>
                            <strong>
                              Superficie :
                            </strong>{" "}
                            {terrain.superficie} m²
                          </p>

                          {terrain.localisation && (
                            <p>
                              <strong>
                                Localisation :
                              </strong>{" "}
                              {terrain.localisation}
                            </p>
                          )}

                          <p>
                            <strong>
                              Statut :
                            </strong>{" "}
                            {terrain.statut}
                          </p>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              },
            )}

          {/* ==================================================
              BLOCS
          ================================================== */}

          {showBlocs &&
            blocsAvecCoordonnees.map(
              (bloc) => {
                const coordinates =
                  getValidGeoCoordinates(
                    bloc.latitude,
                    bloc.longitude,
                  );

                if (!coordinates) {
                  return null;
                }

                const isSelected =
                  selectedBlocId ===
                  bloc.id;

                return (
                  <CircleMarker
                    key={`bloc-${bloc.id}`}
                    center={[
                      coordinates.latitude,
                      coordinates.longitude,
                    ]}
                    radius={
                      isSelected
                        ? 17
                        : 13
                    }
                    pathOptions={{
                      fillColor:
                        isSelected
                          ? "#f97316"
                          : "#eab308",

                      color: "#ffffff",

                      weight:
                        isSelected
                          ? 4
                          : 3,

                      fillOpacity:
                        isSelected
                          ? 0.95
                          : 0.75,
                    }}
                  >
                    <Popup>
                      <div className="min-w-[240px]">
                        <h3 className="text-base font-bold text-yellow-700">
                          Bloc
                        </h3>

                        <div className="mt-3 space-y-1.5 text-sm">
                          <p>
                            <strong>
                              Référence :
                            </strong>{" "}
                            {bloc.reference}
                          </p>

                          <p>
                            <strong>
                              Superficie :
                            </strong>{" "}
                            {bloc.superficie} m²
                          </p>

                          <p>
                            <strong>
                              Nombre de parcelles :
                            </strong>{" "}
                            {bloc.nombreParcelles}
                          </p>

                          <p>
                            <strong>
                              Terrain ID :
                            </strong>{" "}
                            {bloc.terrainId}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleSelectBloc(
                              bloc,
                            )
                          }
                          className="mt-4 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                        >
                          Voir les parcelles
                        </button>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              },
            )}

          {/* ==================================================
              PARCELLES
          ================================================== */}

          {showParcelles &&
            parcellesAvecCoordonnees.map(
              (parcelle) => {
                const coordinates =
                  getValidGeoCoordinates(
                    parcelle.latitude,
                    parcelle.longitude,
                  );

                if (!coordinates) {
                  return null;
                }

                const isSelected =
                  selectedBlocId !== null &&
                  parcelle.bloc?.id ===
                    selectedBlocId;

                const isOtherBloc =
                  selectedBlocId !== null &&
                  parcelle.bloc?.id !==
                    selectedBlocId;

                let fillColor =
                  "#22c55e";

                if (
                  parcelle.statut ===
                  "ATTRIBUEE"
                ) {
                  fillColor =
                    "#f59e0b";
                }

                if (
                  parcelle.statut ===
                  "VENDUE"
                ) {
                  fillColor =
                    "#ef4444";
                }

                return (
                  <CircleMarker
                    key={`parcelle-${parcelle.id}`}
                    center={[
                      coordinates.latitude,
                      coordinates.longitude,
                    ]}
                    radius={
                      isSelected
                        ? 11
                        : 8
                    }
                    pathOptions={{
                      fillColor,

                      color:
                        isSelected
                          ? "#0f172a"
                          : "#ffffff",

                      weight:
                        isSelected
                          ? 3
                          : 2,

                      fillOpacity:
                        isOtherBloc
                          ? 0.2
                          : 0.9,
                    }}
                  >
                    <Popup>
                      <div className="min-w-[220px]">
                        <h3 className="text-base font-bold text-slate-900">
                          {parcelle.reference}
                        </h3>

                        <div className="mt-3 space-y-1.5 text-sm">
                          <p>
                            <strong>
                              Numéro :
                            </strong>{" "}
                            {parcelle.numero}
                          </p>

                          <p>
                            <strong>
                              Superficie :
                            </strong>{" "}
                            {parcelle.superficie} m²
                          </p>

                          <p>
                            <strong>
                              Statut :
                            </strong>{" "}
                            {parcelle.statut}
                          </p>

                          {parcelle.bloc && (
                            <p>
                              <strong>
                                Bloc :
                              </strong>{" "}
                              {
                                parcelle.bloc
                                  .reference
                              }
                            </p>
                          )}

                          {parcelle.proprietaire && (
                            <p>
                              <strong>
                                Propriétaire :
                              </strong>{" "}
                              {
                                parcelle
                                  .proprietaire
                                  .prenom
                              }{" "}
                              {
                                parcelle
                                  .proprietaire
                                  .nom
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              },
            )}
        </MapContainer>
      </div>

      {/* ==================================================
          AVERTISSEMENT COORDONNÉES
      ================================================== */}

      {!loading &&
        !error &&
        terrains.length > 0 &&
        terrainsAvecCoordonnees.length ===
          0 &&
        blocsAvecCoordonnees.length ===
          0 &&
        parcellesAvecCoordonnees.length ===
          0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Les terrains, blocs et parcelles
            existent dans LANDIS, mais aucun
            ne possède encore de coordonnées
            géographiques valides.
          </div>
        )}
    </div>
  );
}