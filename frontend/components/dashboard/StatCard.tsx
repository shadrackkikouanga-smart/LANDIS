import { ReactNode } from "react";


interface StatCardProps {

  title: string;

  value: number;

  icon: ReactNode;

}



export default function StatCard({

  title,

  value,

  icon,

}: StatCardProps) {


  return (

    <div className="
      rounded-xl
      border
      bg-white
      p-6
      shadow-sm
      flex
      items-center
      justify-between
    ">


      <div>

        <p className="text-sm text-gray-500">

          {title}

        </p>


        <p className="text-3xl font-bold mt-2">

          {value}

        </p>


      </div>


      <div className="
        text-gray-700
      ">

        {icon}

      </div>


    </div>

  );

}