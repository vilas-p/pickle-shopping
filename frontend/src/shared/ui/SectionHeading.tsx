interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
}

export function SectionHeading({ eyebrow, title, description, center = true }: Props) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="badge-tag">{eyebrow}</p>}
      <h2 className="section-heading mt-3 font-display">{title}</h2>
      {description && (
        <p className="mt-3 text-base text-brand-earth-700/80">{description}</p>
      )}
    </div>
  );
}
