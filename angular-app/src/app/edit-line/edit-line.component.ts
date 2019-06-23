import { Component, OnInit, Inject, forwardRef, OnDestroy } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { LineService } from '../services/line.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Line } from 'src/models/line';
import { PointPathLine } from 'src/models/point-path-line';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'app-edit-line',
  templateUrl: './edit-line.component.html',
  styleUrls: ['./edit-line.component.css']
})
export class EditLineComponent implements OnInit, OnDestroy {
  getLineForm: FormGroup;
  lineForm: FormGroup;

  line: Line;
  newLine: Line;

  eTag: string = '';
  message: string = '';

  constructor(@Inject(forwardRef(() => HomeComponent)) private _parent: HomeComponent, private _lineService: LineService,
  private formBuilder: FormBuilder) { }

  ngOnDestroy(): void {
    this._parent.RemoveLineFromMapAdmin();
  }

  ngOnInit() {
    this._parent.prikaziDesniMeni();

    this.getLineForm = this.formBuilder.group({
      lineId: ['', Validators.required]
    });

    this.lineForm = this.formBuilder.group({
      lineId: ['', Validators.required],
      direction: ['', Validators.required]
    });
  }

  get getLinef() { return this.getLineForm.controls; }
  get linef() { return this.lineForm.controls; }

  addNewLineBtnClick(){
    this.line = null;
    this.newLine = new Line();
    this.newLine.Id = '';
    this.newLine.Direction = '';
    this.newLine.PointLinePaths = new Array<PointPathLine>();
    this.linef.lineId.setValue(this.newLine.Id);
    this.linef.direction.setValue(this.newLine.Direction);
    this.message = '';
  }

  editLineBtnClick(){
    if(this.getLineForm.invalid)
      return;

    this.message = '';
    this.newLine = null;

    var lineId = this.getLinef.lineId.value;
    this._lineService.getLine(lineId)
      .subscribe(
        data => {
          this.eTag = data.headers.get('etag');
          this.line = data.body;
          this.linef.lineId.setValue(this.line.Id);
          this.linef.direction.setValue(this.line.Direction);

          this._parent.DrawLineOnMapAdmin(this.line);
        },
        err => {
          console.log(err);
        }
      )
  }

  editLine(){
    if(this.lineForm.invalid)
      return;

    this.line.Id = this.linef.lineId.value;
    this.line.Direction = this.linef.direction.value;
    this.line.PointLinePaths = this._parent.EditLineSaveChanges(); 
    this.line.BusStopsOnLines = this._parent.EditBusStopSaveChanges();

    this._lineService.editLine(this.line, this.eTag)
      .subscribe(
        data => {
          this._parent.RemoveLineFromMapAdmin();
          this.line = null;
        },
        err => {
          console.log(err);
          if(err.status == 412)
          {
            this.message = "Neko je vec izvrsio izmene. Osvezite resurs."
          }
        }
      )
  } 

  addLine(){
    if(this.lineForm.invalid)
      return;

    this.newLine.Id = this.linef.lineId.value;
    this.newLine.Direction = this.linef.direction.value;
    
    //dve pocetne tacke da se pojave adminu da moze da menja, lokacija glavna autobuska stanica u novom sadu
    var point1 = new PointPathLine();
    point1.Id = Guid.create().toString();
    point1.LineId = this.newLine.Id;
    point1.SequenceNumber = 1;
    point1.X = 45.264007613065196;
    point1.Y = 19.830164978504172;
    point1.X = 45.264129379187686;
    point1.Y = 19.83007998892026;

    var point2 = new PointPathLine();
    point2.Id = Guid.create().toString();
    point2.LineId = this.newLine.Id;
    point2.SequenceNumber = 1;
    point2.X = 45.264007613065196;
    point2.Y = 19.830164978504172;

    this.newLine.PointLinePaths.push(point1);
    this.newLine.PointLinePaths.push(point2);

    this._lineService.addLine(this.newLine)
      .subscribe(
        data => {
          this.newLine = null;
        },
        err => {
          console.log(err);
        }
      )
  }
  deleteLine(){
    if(this.getLineForm.invalid)
      return;

    this.message = '';

    var lineId = this.getLinef.lineId.value;

    this._lineService.deleteLine(lineId)
      .subscribe(
        data => {
          this.line = null;
        },
        err => {
          console.log(err);
        }
      )
  }

}
