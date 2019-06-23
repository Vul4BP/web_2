import { Guid } from "guid-typescript";
import { BusStopsOnLine } from './bus-stops-on-line';

export class BusStop {
    public Id: string;
    public X: number;
    public Y: number;
    public Name: string;
    public Address: string;
    public BusStopsOnLines: Array<BusStopsOnLine> = new Array();
}