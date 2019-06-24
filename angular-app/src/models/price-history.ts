import { Guid } from "guid-typescript";
import { Pricelist } from './pricelist';
import { ProductType } from './product-type';

export class PriceHistory {
    public Id: string;
    public PricelistId: string;
    public Pricelist: Pricelist;
    public ProductTypeId: string;
    public ProductType: ProductType;
    public Price: number;
}