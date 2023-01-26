import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { StorageService } from './services/storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertifyService } from '../../../services/Alertify.service';
import { AuthService } from '../login/services/Auth.service';
import { environment } from '../../../../../environments/environment';
import { Group } from '../group/models/group';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Storage } from './models/storage';
import { LookUpService } from 'app/core/services/lookUp.service';
import { LookUp } from 'app/core/models/lookUp';

declare var jQuery: any;


@Component({
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss']
})
export class StorageComponent implements OnInit,AfterViewInit {

  dataSource: MatTableDataSource<any>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
  displayedColumns:string[]=["storageId","productId","productStock","isReady","isDeleted","update","delete"];


  productlookUp:LookUp[];
  storage:Storage;
  storageList:Storage[];
  dropdownSettings: IDropdownSettings;

  storageId:number;
  constructor(
    private storageService:StorageService,
    private formBuilder:FormBuilder,
    private alertifyService:AlertifyService,
    private authService:AuthService,
    private lookupService:LookUpService
  ) { }

  
  ngAfterViewInit(): void {
    this.getStorageList();
  }

  ngOnInit(): void {
    this.createStorageAddForm();

    this.lookupService.getProductLookup().subscribe(data=>{
      this.productlookUp=data;
    });
    this.dropdownSettings=environment.getDropDownSetting;
  }
  storageAddForm:FormGroup;

  createStorageAddForm(){
    this.storageAddForm=this.formBuilder.group({
      storageId:[0],
      productId:["",Validators.required],
      productStock:["",Validators.required],
      isReady:[true],
      isDeleted:[false]
    })
  }
  save(){
    if(this.storageAddForm.valid){
      this.storage=Object.assign({},this.storageAddForm.value)
      if(this.storage.storageId==0)
        this.addStorage();
        else
        this.updateStorage();
    }
  }

  addStorage(){
    this.storageService.addStorage(this.storage).subscribe(data=>{
      this.getStorageList();
      this.storage=new Storage();
      jQuery("#storage").modal("hide");
      this.alertifyService.success(data);
      this.clearFormGroup(this.storageAddForm)
    })
  }

  getStorageList(){
    this.storageService.getStorageListDto().subscribe(data=>{
      this.storageList=data;
      this.dataSource=new MatTableDataSource(data.filter(x=>x.isDeleted!=true));
    })
  }

  updateStorage(){
    this.storageService.updateStorage(this.storage).subscribe(data=>{
      var index=this.storageList.findIndex(x=>x.storageId==this.storage.storageId);
    // let updatedoBJ:"";=updatedoBJ;
      this.storageList[index]=this.storage;
      this.dataSource=new MatTableDataSource(this.storageList);
      this.configDataTable();
      this.storage=new Storage();
      jQuery('#storage').modal("hide");
      this.alertifyService.success(data);
      this.clearFormGroup(this.storageAddForm);
    })
  }
  configDataTable(): void {
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
	}
  clearFormGroup(group: FormGroup) {

    group.markAsUntouched();
    group.reset();

    Object.keys(group.controls).forEach(key => {
      group.get(key).setErrors(null);
      if (key == "storageId")
        group.get(key).setValue(0);
      else if (key == "isDeleted")
        group.get(key).setValue(false);
    });
  }
  deleteStorage(id: number) {

    this.storageService.deleteStorage(id).subscribe(data => {
      this.alertifyService.success(data.toString());
      var index = this.storageList.findIndex(x => x.storageId == id);
      this.storageList[index].isDeleted = true;
      this.storageList=this.storageList.filter(x=>x.isDeleted !=true)
      this.dataSource = new MatTableDataSource(this.storageList);
			this.configDataTable();
    });
  }
  checkClaim(claim: string): boolean {
    return this.authService.claimGuard(claim)
  }
  applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

  getStorageById(id:number){
    this.clearFormGroup(this.storageAddForm);
    this.storageService.getStorageById(id).subscribe(data=>{
      this.storage=data;
      this.storageAddForm.patchValue(data);
    })
  }
}
