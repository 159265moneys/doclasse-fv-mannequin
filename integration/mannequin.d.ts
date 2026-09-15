export interface MannequinOptions {
  assetBase?: string;
  posterUrl?: string;
  motion?: boolean;
}
export function mountMannequin(host: HTMLElement, options?: MannequinOptions): () => void;
