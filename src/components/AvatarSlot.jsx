// Emplacement du futur mini-avatar 3D. Tant qu'il est vide, il reste décoratif ;
// l'avatar pourra être passé en enfant, avec sa propre description accessible.
function AvatarSlot({ children, className = '' }) {
  return (
    <div
      aria-hidden={children ? undefined : true}
      className={`aspect-square overflow-hidden rounded-full border border-ivory/25 ${className}`}
      data-avatar-slot
    >
      {children}
    </div>
  )
}

export default AvatarSlot
