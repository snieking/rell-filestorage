export interface IAsset {
  id: Buffer;
  name: string;
  issuing_chain_rid: Buffer;
}

export interface IAssetBalance {
  id: Buffer;
  name: string;
  amount: number;
  chain_id: Buffer;
}
