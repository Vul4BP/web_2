import { Guid } from "guid-typescript";
import { PriceHistory } from './price-history';

export class Pricelist {
    public Id: string;
    public From: Date;
    public To: Date;
    public PriceHistories: Array<PriceHistory> = new Array();
}