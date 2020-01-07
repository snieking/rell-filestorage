export interface Asset {
  id: string;
  name: string;
  issuing_chain_rid: string;
}

export interface AssetBalance {
  id: string;
  name: string;
  amount: number;
  chain_id: string;
}