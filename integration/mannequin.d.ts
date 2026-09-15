export interface MannequinOptions {
  assetBase?: string;
  modelUrl?: string;
  posterUrl?: string;
  motion?: boolean;
  /** Return the existing heroState.scroll (0..1). */
  getScroll?: () => number;
  /** Existing runtime.pointer uses window coordinates normalized to -1..1, Y down. */
  getPointer?: () => { nx: number; ny: number };
  /** Pass the site's existing onReady registration function to retain its curtain timing. */
  subscribeReady?: (callback: () => void) => (() => void);
  debug?: boolean;
}
export function mountMannequin(host: HTMLElement, options?: MannequinOptions): () => void;
