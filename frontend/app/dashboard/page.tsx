"use client";

import { useEffect, useState } from "react";

import {
  FolderKanban,
  Map,
  LandPlot,
  Users,
} from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";

import { getDashboard } from "@/services/dashboard";


export default function DashboardPage() {


  const [stats, setStats] =
    useState<any>(null);



  useEffect(() => {


    async function loadDashboard() {


      try {


        const data =
          await getDashboard();


        setStats(data);


      } catch (error) {


        console.error(
          "Erreur chargement dashboard :",
          error,
        );


      }


    }


    loadDashboard();


  }, []);




  if (!stats) {


    return (

      <div
        className="
          p-6
          text-gray-600
        "
      >

        Chargement du tableau de bord...

      </div>

    );

  }





  return (

    <div>


      <h1
        className="
          text-3xl
          font-bold
        "
      >
        Tableau de bord LANDIS
      </h1>



      <p
        className="
          mt-2
          text-gray-600
        "
      >
        Vue générale de votre activité de lotissement
      </p>





      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-4
          gap-6
          mt-8
        "
      >



        <StatCard

          title="Projets"

          value={
            stats.projets
          }

          icon={
            <FolderKanban />
          }

        />





        <StatCard

          title="Terrains"

          value={
            stats.terrains.nombre
          }

          icon={
            <Map />
          }

        />


        <StatCard

          title="Blocs"

          value={
            stats.blocs.nombreDeclares
          }

          icon={
            <Map />
          }

        />





        <StatCard

          title="Parcelles disponibles"

          value={
            stats.parcelles.disponibles
          }

          icon={
            <LandPlot />
          }

        />



      </div>





      <div
        className="
          mt-8
        "
      >

        <RecentActivity />

      </div>



    </div>

  );


}