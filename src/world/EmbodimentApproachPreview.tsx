import { EmbodiedSite } from './EmbodiedSite';

export function EmbodimentApproachPreview({ weight }: { weight: number }) {
  if (weight <= 0.02) return null;

  const previewScale = 0.08 + weight * 0.92;

  return (
    <>
      <directionalLight position={[8, 16, 6]} intensity={0.35 + weight * 0.75} />
      <group scale={previewScale}>
        <EmbodiedSite />
      </group>
    </>
  );
}
