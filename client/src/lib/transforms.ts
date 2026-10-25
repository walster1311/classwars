export interface PlayerTransform {
  x: number;
  y: number;
  z: number;
  rotY: number;
  animation: string;
}

// In-memory fast registry for high-frequency 60Hz 3D player transforms
// Bypasses React Virtual DOM overhead completely during avatar movement
const transforms = new Map<string, PlayerTransform>();

export function getPlayerTransform(sessionId: string): PlayerTransform | undefined {
  return transforms.get(sessionId);
}

export function setPlayerTransform(sessionId: string, transform: Partial<PlayerTransform>) {
  const current = transforms.get(sessionId) || { x: 0, y: 0, z: 0, rotY: 0, animation: 'idle' };
  transforms.set(sessionId, {
    x: transform.x !== undefined ? transform.x : current.x,
    y: transform.y !== undefined ? transform.y : current.y,
    z: transform.z !== undefined ? transform.z : current.z,
    rotY: transform.rotY !== undefined ? transform.rotY : current.rotY,
    animation: transform.animation !== undefined ? transform.animation : current.animation
  });
}

export function removePlayerTransform(sessionId: string) {
  transforms.delete(sessionId);
}

export function clearPlayerTransforms() {
  transforms.clear();
}
