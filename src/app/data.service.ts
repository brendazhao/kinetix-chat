import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class DataService {
  // Ask for data.json
  constructor( private http: Http ) {

   }
   fetchData() {
 //    return this.http.get('https://chatapp-b8b34.firebaseio.com/.json')// './assets/public/people.json')
 //    .map((res) => res.json())
 //    .subscribe(
       // process the data
  //     (data) => console.log(data)
//     );
   }
}
