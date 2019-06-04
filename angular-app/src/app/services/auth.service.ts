import { Injectable } from '@angular/core';
import { User } from 'src/models/user';
import { HttpClient } from '@angular/common/http';
import { Observable, pipe, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = false;
  api_route: String = 'http://localhost:52295';

  constructor(private http: HttpClient, private _router: Router) { }

  login(user: User): Observable<any> {
    return this.http.post<any>(`${this.api_route}/oauth/token`, `username=`+ user.Email +`&password=`+ user.Password + `&grant_type=password`, { 'headers': { 'Content-type': 'x-www-form-urlencoded' } }).pipe(
      map(res => {
        console.log(res.access_token);

        let jwt = res.access_token;

        let decodedJwtData = this.parseToken(jwt);
        localStorage.setItem('token', jwt);
        localStorage.setItem('role', decodedJwtData.role);
        this._router.navigate(['/home/profile']);
      }),

      catchError(this.handleError<any>('login'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }

  private parseToken(token:any): any {
    let jwtData = token.split('.')[1];
    let decodedJwtJsonData = window.atob(jwtData);
    let decodedJwtData = JSON.parse(decodedJwtJsonData);
    return decodedJwtData;
  }

  logout(): void {
    this.isLoggedIn = false;
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  } 

  getToken(): any{
    return localStorage.getItem('token');
  }

  getRole(): any{
    let tkn = this.getToken();
    if (tkn == null) {
      return "";
    }

    let jwtParsed = this.parseToken(tkn);
    return jwtParsed.role;
  }

  getUserType(): any{
    let tkn = this.getToken();
    if (tkn == null) {
      return "";
    }
    
    let jwtParsed = this.parseToken(tkn);
    return jwtParsed.userType;
  }

  getUserFiles(): any{
    let tkn = this.getToken();
    if (tkn == null) {
      return "";
    }
    
    let jwtParsed = this.parseToken(tkn);
    return jwtParsed.userFiles;
  }

  getUserStatus(): any{
    let tkn = this.getToken();
    if (tkn == null) {
      return "";
    }
    
    let jwtParsed = this.parseToken(tkn);
    return jwtParsed.userStatus;
  }

  getUserHasDocuments(): any{
    let tkn = this.getToken();
    if (tkn == null) {
      return false;
    }
    
    let jwtParsed = this.parseToken(tkn);
    if (jwtParsed.userHasDocuments == "True") {
       return true;
    } else {
      return false;
    }
  }
}