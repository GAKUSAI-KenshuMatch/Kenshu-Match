"use client";

interface RoleCardProps {
  hanko: string;
  name: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

/** Shared role-selection card, used identically by /register (step 1) and /complete-profile. */
export function RoleCard({ hanko, name, description, selected, onSelect }: RoleCardProps) {
  return (
    <button
      type="button"
      className={`role-card${selected ? " is-selected" : ""}`}
      onClick={onSelect}
    >
      <span className="hanko hanko--role" aria-hidden="true">
        {hanko}
      </span>
      <span className="role-card__name">{name}</span>
      <span className="role-card__desc">{description}</span>
    </button>
  );
}
