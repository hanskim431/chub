interface AuthTitleCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function AuthTitleCard({
  title,
  description,
  children,
}: AuthTitleCardProps) {
  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      ) : null}
      <div className="mt-5 flex flex-col items-center gap-2">{children}</div>
    </section>
  );
}
