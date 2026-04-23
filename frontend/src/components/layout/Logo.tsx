export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img
        src="/images/logo.jpeg"
        width={34}
        height={38}
        alt="Futskol"
        className="rounded-xl object-cover"
        style={{ width: 34, height: 38 }}
      />
      <div className="leading-tight">
        <p className="text-base font-extrabold tracking-tight">
          Futskol<span className="text-secondary"> Admin</span>
        </p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Gestão da pelada</p>
      </div>
    </div>
  );
}
