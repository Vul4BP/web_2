import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BusStop } from 'src/models/bus-stop';
import { BusStopService } from '../services/bus-stop.service';
import { MatTableDataSource } from '@angular/material';
import { Guid } from 'guid-typescript';
import { BusStopsOnLine } from 'src/models/bus-stops-on-line';
import { BusStopsOnLineService } from '../services/bus-stops-on-line.service';

@Component({
  selector: 'app-edit-bus-stop',
  templateUrl: './edit-bus-stop.component.html',
  styleUrls: ['./edit-bus-stop.component.css']
})
export class EditBusStopComponent implements OnInit {

  getBusStopForm: FormGroup;
  busStopForm: FormGroup;
  lineForm: FormGroup;
  busStop: BusStop;
  newBusStop: BusStop;
  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['Id'];
  selectedRowIndex: String;
  eTag: string;
  message: string = '';
  messageIsError: boolean = false;

  constructor(@Inject(forwardRef(() => HomeComponent)) private _parent: HomeComponent, private formBuilder: FormBuilder,
    private _busStopService: BusStopService, private _busStopsOnLineService: BusStopsOnLineService) { }

  ngOnInit() {
    this._parent.prikaziDesniMeni();

    this.getBusStopForm = this.formBuilder.group({
      busStopId: ['', Validators.required]
    });

    this.lineForm = this.formBuilder.group({
      lineId: ['', Validators.required]
    });

    this.busStopForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  get getBusStopf() { return this.getBusStopForm.controls; }
  get linef() { return this.lineForm.controls; }
  get busStopf() { return this.busStopForm.controls; }

  DisplayMessage(text:string, error:boolean) {
    this.message = text;
    this.messageIsError = error;
  }

  public click(){
    this.message = '';
  }

  addBtnClick(){
    this.selectedRowIndex = null;
    this.busStop = null;
    this.newBusStop = new BusStop();
    this.newBusStop.BusStopsOnLines = new Array<BusStopsOnLine>();
    this.dataSource = new MatTableDataSource(this.createDataSource(this.newBusStop.BusStopsOnLines));

    this.busStopForm.reset();
    this.message = '';
  }

  editBtnClick(){
    if(this.getBusStopForm.invalid)
    return;

    this.message = '';
    this.newBusStop = null;

    var busStopId = this.getBusStopf.busStopId.value;

    this._busStopService.getBusStop(busStopId)
      .subscribe(
        data => {
          this.eTag = data.headers.get('etag');
          this.busStop = data.body;
          this.busStopf.name.setValue(this.busStop.Name);
        },
        err => {
          console.log(err);
        }
      )
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  createDataSource(data: any): any{
    var retVal = new Array();
    for(let item of data){
      var pushVal = {
        Id : item.LineId,
        BusStopOnLines : item.Id
      };
      retVal.push(pushVal);      
    }
    return retVal;
  }

  selectRow(row: any){
    this.selectedRowIndex = row.Id;
  }

  addLine(){
    if(this.lineForm.invalid)
      return;

    var busStopOnLine = new BusStopsOnLine();
    busStopOnLine.Id = Guid.create().toString();
    busStopOnLine.LineId = this.linef.lineId.value;

    if(this.newBusStop.BusStopsOnLines.find(x => x.LineId == busStopOnLine.LineId) != null)
      return;

    this.newBusStop.BusStopsOnLines.push(busStopOnLine);
    this.dataSource = new MatTableDataSource(this.createDataSource(this.newBusStop.BusStopsOnLines));
  }

  deleteLine(){
    var busStopOnLine = this.newBusStop.BusStopsOnLines.find(x => x.LineId == this.selectedRowIndex);
    if(busStopOnLine==null)
      return;

    var index = this.newBusStop.BusStopsOnLines.findIndex(x => x.Id == busStopOnLine.Id);
    this.newBusStop.BusStopsOnLines.splice(index, 1);
    this.dataSource = new MatTableDataSource(this.createDataSource(this.newBusStop.BusStopsOnLines));
    this.selectedRowIndex = null;
  }

  editBusStop(){
    if(this.busStopForm.invalid)
      return;
    
    this.busStop.Name = this.busStopf.name.value;
    
    this._busStopService.editBusStop(this.busStop, this.eTag)
      .subscribe(
        data => {
          this.busStop = null;
          this.DisplayMessage("Uspesno izvrsene promene", false);
        },
        err => {
          console.log(err);
          if(err.status == 412)
          {
            this.DisplayMessage("Neko je vec izvrsio izmene. Osvezite resurs", true);
          }
          else{
            this.DisplayMessage("Desila se greska", true);
          }
        }
      )
  }

  addBusStop(){
    if(this.busStopForm.invalid)
      return;
    
    this.newBusStop.Id = Guid.create().toString();
    this.newBusStop.X = 45.264007613065196;
    this.newBusStop.Y = 19.830164978504172;
    this.newBusStop.Name = this.busStopf.name.value;

    this.newBusStop.BusStopsOnLines.forEach(element => {
      element.BusStopId = this.newBusStop.Id;
    });

    this._busStopService.addBusStop(this.newBusStop)
      .subscribe(
        data => {
          this.newBusStop = null;
          this.DisplayMessage("Uspesno izvrsene promene", false);
        },
        err => {
          console.log(err);
          this.DisplayMessage("Desila se greska", true);
        }
      )
  }

  deleteBtnClick(){
    if(this.getBusStopForm.invalid)
      return;

    this.message = '';
    var busStopId = this.getBusStopf.busStopId.value;

    this._busStopService.deleteBusStop(busStopId)
      .subscribe(
        data => {
          this.busStop = null;
          this.selectedRowIndex = null;
          this.DisplayMessage("Uspesno izvrsene promene", false);
        },
        err => {
          console.log(err);
          this.DisplayMessage("Desila se greska", true);
        }
      )
  }

}

