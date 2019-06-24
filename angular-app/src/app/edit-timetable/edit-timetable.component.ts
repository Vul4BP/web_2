import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { TimetableService } from '../services/timetable.service';
import { MatTableDataSource } from '@angular/material';
import { Timetable } from '../../models/timetable';
import { LineService } from '../services/line.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { sha256 } from 'js-sha256';

@Component({
  selector: 'app-edit-timetable',
  templateUrl: './edit-timetable.component.html',
  styleUrls: ['./edit-timetable.component.css']
})
export class EditTimetableComponent implements OnInit {

  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['Id', 'Direction'];

  selectedRowIndex: Guid;
  timetables: Array<Timetable>;
  selectedDay: string;

  timetableJson: Array<string>;
  timeForm: FormGroup;
  lineForm: FormGroup;
  newTimetable: Timetable;
  oldTimes: string;

  message: string = '';
  messageIsError: boolean = false;

  constructor(@Inject(forwardRef(() => HomeComponent)) private _parent: HomeComponent,
     private _timetablesevice: TimetableService, private _lineService: LineService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this._parent.prikaziDesniMeni();
    this.getAllTimetables();
    this.timeForm = this.formBuilder.group({
      hour: ['', Validators.compose([Validators.required, Validators.max(23), Validators.min(0),, Validators.minLength(2), Validators.maxLength(2)])],
      minute: ['', Validators.compose([Validators.required, Validators.max(59), Validators.min(0), Validators.minLength(2), Validators.maxLength(2)])]
    });
    this.lineForm = this.formBuilder.group({
      lineId: ['', Validators.required]
    });
  }

  
  DisplayMessage(text:string, error:boolean) {
    this.message = text;
    this.messageIsError = error;
  }

  getAllTimetables(){
    this._timetablesevice.getAllTimetables()
    .subscribe(
      data => {
        this.timetables = data;
        this.dataSource = new MatTableDataSource(this.createDataSource(data));
        this.timetables.forEach(element => {
          var rawValue = `${element.Id}${element.LineId}${element.Times}`;
          element['etag'] = sha256(rawValue);
        });
      },
      err => {
        console.log(err);
      }
    )
  }

  createDataSource(data: any): any{
    var retVal = new Array();
    for(let item of data){
      var pushVal = {
        Id : item.LineId,
        Direction : item.Line.Direction,
        LineNumber : (Number)(item.LineId.replace('A','').replace('B','').replace('A','').replace('B','')),
        TimetableId: item.Id
      };

      retVal.push(pushVal);      
    }
    return retVal.sort((x,y) => x.LineNumber - y.LineNumber);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  selectLine(row: any){
    if(this.oldTimes){
      var timetable = this.timetables.find(x => x.Id == this.selectedRowIndex);
      if(timetable != null)
        timetable.Times = this.oldTimes;
    }

    this.selectedRowIndex = row.TimetableId;
    var timetable = this.timetables.find(x => x.Id == this.selectedRowIndex);
    this.oldTimes = timetable.Times.toString();

    this.timetableJson = null;
    this.selectedDay = null;
    this.newTimetable = null;
  }

  getTimesJson(timetableId: Guid, pickedDay: string){
    var timetable = this.timetables.find(x => x.Id == timetableId);
    if(timetable == null){
      if(this.newTimetable == null)
        return;
      else
        timetable = this.newTimetable;
    }

    let timesJson = JSON.parse(timetable.Times);
    let selectedDayTimesJson = new Array<string>();
    if(pickedDay == "Radni_dan"){
      selectedDayTimesJson = timesJson['Radni_dan'];
      this.selectedDay = "Radni_dan";
    }
    else if(pickedDay == "Subota"){
      selectedDayTimesJson = timesJson['Subota'];
      this.selectedDay = "Subota";
    }
    else if(pickedDay == "Nedelja"){
      selectedDayTimesJson = timesJson['Nedelja'];
      this.selectedDay = "Nedelja";
    }

    var timetableJson = new Array<string>();
    if(selectedDayTimesJson == null){
      this.timetableJson = timetableJson;
      return;
    }

    let polasciPoSatima = {};
    selectedDayTimesJson.forEach(
      (item, indeks) => {
        let satMinut = item.split(":");
        if (!(satMinut[0] in polasciPoSatima)) {
          polasciPoSatima[satMinut[0]] = new Array<string>();
        }

        polasciPoSatima[satMinut[0]].push(satMinut[1]);
      });
    
    for (let sat = 4; sat < 24+4; sat++) {
      let satStr = (sat % 24).toString().padStart(2, '0');
      if (satStr in polasciPoSatima) {
        polasciPoSatima[satStr] = polasciPoSatima[satStr].sort((x,y) => (Number)(x) - (Number)(y));
        let prikazJednogSata = satStr+"|" + polasciPoSatima[satStr].join(",");
        timetableJson.push(prikazJednogSata);
      }
    }
    this.timetableJson = timetableJson;
    this.linef.lineId.setValue(timetable.LineId);
  }

  get f() { return this.timeForm.controls; }
  get linef() { return this.lineForm.controls; }

  public click(){
    this.message = '';
  }

  addTime(){
    if (this.timeForm.invalid) {
      return;
    }

    var timetable = this.timetables.find(x => x.Id == this.selectedRowIndex);
    if(timetable == null){
      if(this.newTimetable == null)
        return;
      else
        timetable = this.newTimetable;
    }

    let timesJson = JSON.parse(timetable.Times);
    let selectedDayTimesJson = new Array<string>();
    selectedDayTimesJson = timesJson[this.selectedDay];

    var time = `${this.f.hour.value}:${this.f.minute.value}`;
    if(selectedDayTimesJson.includes(time))
      return;
    
    selectedDayTimesJson.push(time);
    timetable.Times = JSON.stringify(timesJson);
    this.getTimesJson(this.selectedRowIndex,this.selectedDay);
  }

  removeTime(){
    if (this.timeForm.invalid) {
      return;
    }
    
    var timetable = this.timetables.find(x => x.Id == this.selectedRowIndex);
    if(timetable == null){
      if(this.newTimetable == null)
        return;
      else
        timetable = this.newTimetable;
    }

    let timesJson = JSON.parse(timetable.Times);
    let selectedDayTimesJson = new Array<string>();
    selectedDayTimesJson = timesJson[this.selectedDay];

    var time = `${this.f.hour.value}:${this.f.minute.value}`;
    if(!selectedDayTimesJson.includes(time))
      return;
    
    var index = selectedDayTimesJson.indexOf(time);
    selectedDayTimesJson.splice(index,1);
    timetable.Times = JSON.stringify(timesJson);
    this.getTimesJson(this.selectedRowIndex,this.selectedDay);
  }

  editTimetable(timetable: Timetable){
    if (this.lineForm.invalid) {
      return;
    }

    var timetable = this.timetables.find(x => x.Id == this.selectedRowIndex);
    if(timetable == null)
      return;

    timetable.LineId = this.linef.lineId.value;
    
    this._timetablesevice.editTimetable(timetable)
    .subscribe(
      data => {
        this.getAllTimetables();
        this.selectedRowIndex = null;
        //this.getTimesJson(this.selectedRowIndex,this.selectedDay);
        this.oldTimes = null;
        this.timetableJson = null;
        this.selectedDay = null;
        this.newTimetable = null;
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
      });
  }

  addNewBtnClick(){
    this.selectedRowIndex = Guid.create();
    this.timetableJson = null;
    this.newTimetable = new Timetable();
    this.newTimetable.Id = this.selectedRowIndex;
    this.newTimetable.Times = JSON.stringify({"Radni_dan": [], "Subota": [], "Nedelja": []});
  }

  minuteIsNotNumber(){
    var val = this.f.minute.value;
    if(isNaN(val))
      this.f.minute.setErrors({'notnumber': true});
  }

  hourIsNotNumber(){
    var val = this.f.hour.value;
    if(isNaN(val))
      this.f.hour.setErrors({'notnumber': true});
  }

  addTimetable(){
    if (this.lineForm.invalid) {
      return;
    }

    this.newTimetable.LineId = this.linef.lineId.value;
    
    this._timetablesevice.addTimetable(this.newTimetable)
    .subscribe(
      data => {
        this.getAllTimetables();
        this.getTimesJson(this.selectedRowIndex,this.selectedDay);
        this.oldTimes = null;
        this.newTimetable = null;
        this.DisplayMessage("Uspesno izvrsene promene", false);
      },
      err => {
        console.log(err);
        this.DisplayMessage("Desila se greska", true);
      });
  }

  deleteBtnClick(){
    var timetable = this.timetables.find(x => x.Id == this.selectedRowIndex);
    if(timetable == null){
      return;
    }

    this._timetablesevice.deleteTimetable(timetable.Id)
    .subscribe(
      data => {
        this.getAllTimetables();
        this.DisplayMessage("Uspesno izvrsene promene", false);
      },
      err => {
        console.log(err);
        this.DisplayMessage("Desila se greska", true);
      });
  }
}
