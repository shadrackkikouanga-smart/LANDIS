const activities = [
  "Nouveau projet créé",
  "Nouvelle parcelle enregistrée",
  "Terrain attribué à un acquéreur",
  "Paiement reçu",
];


export default function RecentActivity() {

  return (

    <div className="
      rounded-xl
      border
      bg-white
      p-6
      shadow-sm
    ">


      <h2 className="
        text-lg
        font-semibold
        mb-4
      ">

        Activité récente

      </h2>



      <ul className="space-y-3">


        {activities.map((activity, index) => (

          <li
            key={index}
            className="
              text-gray-600
              border-b
              pb-2
            "
          >

            {activity}

          </li>

        ))}


      </ul>


    </div>

  );

}