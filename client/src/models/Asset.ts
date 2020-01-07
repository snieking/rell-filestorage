export interface Asset {
  id: Buffer;
  name: string;
  issuing_chain_rid: Buffer;
}

export interface AssetBalance {
  id: Buffer;
  name: string;
  amount: number;
  chain_id: Buffer;
}