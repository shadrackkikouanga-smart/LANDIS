import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  description?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  description,
}: StatCardProps) {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      {/* Décoration */}
      <div
        className="
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-28
          w-28
          rounded-full
          bg-gray-50
          transition-transform
          duration-500
          group-hover:scale-150
        "
      />

      <div
        className="
          relative
          flex
          items-start
          justify-between
          gap-4
        "
      >
        {/* Informations */}
        <div className="min-w-0">
          <p
            className="
              text-sm
              font-medium
              text-gray-500
            "
          >
            {title}
          </p>

          <p
            className="
              mt-2
              text-3xl
              font-bold
              tracking-tight
              text-gray-900
            "
          >
            {new Intl.NumberFormat("fr-FR").format(value)}
          </p>

          {description && (
            <p
              className="
                mt-2
                text-xs
                text-gray-500
              "
            >
              {description}
            </p>
          )}
        </div>

        {/* Icône */}
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-gray-100
            text-gray-700
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:bg-gray-900
            group-hover:text-white
          "
        >
          {icon}
        </div>
      </div>

      {/* Ligne décorative */}
      <div
        className="
          relative
          mt-5
          h-1
          w-full
          overflow-hidden
          rounded-full
          bg-gray-100
        "
      >
        <div
          className="
            h-full
            w-1/3
            rounded-full
            bg-gray-900
            transition-all
            duration-500
            group-hover:w-2/3
          "
        />
      </div>
    </div>
  );
}