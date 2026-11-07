import { useLayoutEffect, useRef, useState } from "react";
import { Quote } from "lucide-react";
import { getUploadUrl } from "../lib/api";
import type { AboutTeamMember } from "../lib/admin-service";
import "../about-team.css";

const initials = (name: string) => name.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

/** Carte membre : portrait 4:5 cadré sur le visage, nom et rôle posés sur la photo, biographie repliable. */
function TeamMemberCard({ member, index }: { member: AboutTeamMember; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const bioRef = useRef<HTMLParagraphElement>(null);

  // N'affiche « Lire la suite » que si la biographie dépasse réellement les 4 lignes.
  useLayoutEffect(() => {
    const element = bioRef.current;
    if (!element) return;
    const measure = () => setOverflowing(element.scrollHeight > element.clientHeight + 2);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [member.bio]);

  return (
    <article className="team-card">
      <div className="team-card-portrait">
        {member.photo
          ? <img src={getUploadUrl(member.photo)} alt={`Portrait de ${member.name}`} loading="lazy" />
          : <div className="team-card-initials" aria-hidden="true"><span>{initials(member.name)}</span></div>}
        <span className="team-card-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <div className="team-card-identity">
          <span className="team-card-role">{member.role}</span>
          <h3>{member.name}</h3>
        </div>
      </div>
      {member.bio ? (
        <div className="team-card-body">
          <Quote size={18} className="team-card-quote" aria-hidden="true" />
          <p ref={bioRef} className={expanded ? "is-expanded" : ""}>{member.bio}</p>
          {overflowing || expanded ? (
            <button type="button" className="team-card-more" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
              {expanded ? "Réduire" : "Lire la suite"}
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function AboutTeam({ team }: { team: AboutTeamMember[] }) {
  return (
    <section className="team-section" aria-labelledby="team-title">
      <div className="team-section-inner">
        <header className="team-heading">
          <div>
            <span className="team-eyebrow">LES PERSONNES DERRIÈRE ORION</span>
            <h2 id="team-title">Une aventure portée <em>par des personnes.</em></h2>
          </div>
          <p>Découvrez celles et ceux qui imaginent, construisent et font grandir ORION au quotidien.</p>
        </header>
        {team.length ? (
          <div className={`team-grid count-${Math.min(team.length, 4)}`}>
            {team.map((member, index) => <TeamMemberCard key={member.id} member={member} index={index} />)}
          </div>
        ) : (
          <p className="team-empty">ORION se construit progressivement avec sa communauté. Les profils de l’équipe seront présentés ici au fur et à mesure.</p>
        )}
      </div>
    </section>
  );
}
