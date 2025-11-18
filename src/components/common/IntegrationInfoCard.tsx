type Integration = {
  region: string;
  items: {
    name: string;
    description: string;
  }[];
};

export function IntegrationInfoCard({
  title,
  description,
  integrations,
}: {
  title: string;
  description: string;
  integrations: Integration[];
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_10px_40px_rgba(2,6,23,0.4)]">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Integrasyon Planı</p>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <div key={integration.region} className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{integration.region}</p>
            <ul className="mt-3 space-y-2">
              {integration.items.map((item) => (
                <li key={item.name}>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
