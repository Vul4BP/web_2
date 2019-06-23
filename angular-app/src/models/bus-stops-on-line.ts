import { Guid } from "guid-typescript";
import { BusStop } from './bus-stop';
import { Line } from './line';

export class BusStopsOnLine {
    public Id: string;
    public BusStopId: string;
    public BusStop: BusStop;
    public LineId: string;
    public Line: Line;
}