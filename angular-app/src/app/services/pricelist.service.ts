import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from 'src/models/user';
import { Guid } from 'guid-typescript';
import { Pricelist } from 'src/models/pricelist';

@Injectable({
  providedIn: 'root'
})
export class PricelistService {
  api_route: String = 'http://localhost:52295/api/Pricelists';

  constructor(private http: HttpClient) { }

  public getAllPricelists(): Observable<any>{
    return this.http.get(`${this.api_route}`);
  }

  public addPricelist(pricelist: Pricelist, from: string, to: string): Observable<any>{
    let pricelistHelper = new Object;
    pricelistHelper["From"] = from;
    pricelistHelper["To"] = to;
    pricelistHelper["Id"] = pricelist.Id;
    pricelistHelper["PriceHistories"] = pricelist.PriceHistories;
    var json = JSON.stringify(pricelistHelper);
    console.log(json);
    return this.http.post(`${this.api_route}`, json , { "headers" : {'Content-type' : 'application/json'}})
  } 

  public editPricelist(id: string, from: string, to: string, etag: string): Observable<any>{
    return this.http.put(`${this.api_route}/${id}`,`Id=${id}&From=${from}&To=${to}`, { "headers" : {'etag': `${etag}`,'Content-type' : 'application/x-www-form-urlencoded'}})
  } 

  public deletePricelist(id: string): Observable<any>{
    return this.http.delete(`${this.api_route}/${id}`, { "headers" : {'Content-type' : 'application/x-www-form-urlencoded'}})
  } 
}