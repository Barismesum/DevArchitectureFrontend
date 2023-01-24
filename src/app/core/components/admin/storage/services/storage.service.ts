import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { environment } from 'environments/environment';
import { Storage } from '../models/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private httpClient:HttpClient) { }

  getStorageList():Observable<Storage[]>{
    return this.httpClient.get<Storage[]>(environment.getApiUrl+"/Storages/getall")
  }

  getStorageById(id:number):Observable<Storage>{
    return this.httpClient.get<Storage>(environment.getApiUrl+"/Storages/getbyid?storagesId="+id)
  }

  addStorage(storage:Storage):Observable<any>{
    var result=this.httpClient.post(environment.getApiUrl+"/Storages",storage,{responseType:'text'});
    return result;
  }

  updateStorage(storage:Storage):Observable<any>{
    var result=this.httpClient.put(environment.getApiUrl+"/Storages",storage,{responseType:'text'});
    return result;
  }
  deleteStorage(id:number){
    return this.httpClient.request('delete',environment.getApiUrl+"/Storages",{body:{storageId:id}})
  }

  getStorageListDto(): Observable<Storage[]> {

    return this.httpClient.get<Storage[]>(environment.getApiUrl + '/Storages/getstoragelistdto')
  }
}
