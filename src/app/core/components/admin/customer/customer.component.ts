import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CustomerService } from './services/customer.service';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { AlertifyService } from './../../../services/Alertify.service';
import { AuthService } from './../login/services/Auth.service';
import { Customer } from './models/customer';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LookUp } from 'app/core/models/lookUp';
import { environment } from 'environments/environment';
import { LookUpService } from 'app/core/services/lookUp.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
declare var jQuery: any;

@Component({
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit,AfterViewInit {
  dataSource:MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator:MatPaginator;
  @ViewChild(MatSort)sort:MatSort;
  displayedColumns:string[]=["customerId","customerName","mobilePhones","address","isDeleted","update","delete"]



  customer:Customer;
  customerList:Customer[];
 
  dropdownSettings: IDropdownSettings;

  isGroupChange: boolean = false;
  isClaimChange: boolean = false;


  customerId:number;

  constructor(
    private customerService:CustomerService,
    private formBuilder:FormBuilder,
    private alertifyService:AlertifyService,
    private lookUpService: LookUpService,
    private authService:AuthService
  ) { }

  ngAfterViewInit(): void {
   this.getCustomerList();
  }



  customerAddForm:FormGroup;

  ngOnInit(): void {
    this.createCustomerAddForm();

    this.dropdownSettings = environment.getDropDownSetting;


   
  }

  createCustomerAddForm() {
    this.customerAddForm = this.formBuilder.group({
      customerId: [0],
      customerName: ["", Validators.required],
      mobilePhones: ["",Validators.required],
      address: [""],
      isDeleted: [false],
    
    })
  }

   save() {
    if (this.customerAddForm.valid) {
      this.customer = Object.assign({}, this.customerAddForm.value)

      if (this.customer.customerId == 0)
        this.addCustomer();
      else
        this.updateCustomer();

    }
  }

  addCustomer() {

    this.customerService.addCustomer(this.customer).subscribe(data => {
      this.getCustomerList();
      this.customer = new Customer();
      jQuery("#costumer").modal("hide");
      this.alertifyService.success(data);
      this.clearFormGroup(this.customerAddForm);

    })
  }


  onItemSelect(comboType: string) {
    this.setComboStatus(comboType);
  }

  onSelectAll(comboType: string) {
    this.setComboStatus(comboType);
  }
  onItemDeSelect(comboType: string) {
    this.setComboStatus(comboType);
  }
  setComboStatus(comboType: string) {

    if (comboType == "Group")
      this.isGroupChange = true;
    else if (comboType == "Claim")
      this.isClaimChange = true;

  }


  getCustomerList(){
    this.customerService.getCustomerList().subscribe(data=>{
      this.customerList=data;
      this.dataSource=new MatTableDataSource(data.filter(x=>x.isDeleted!=true));
    })
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

  updateCustomer() {

    this.customerService.updateCustomer(this.customer).subscribe(data => {

      var index = this.customerList.findIndex(x => x.customerId == this.customer.customerId);
      this.customerList[index] = this.customer;
      this.dataSource = new MatTableDataSource(this.customerList);
			this.configDataTable();
      this.customer = new Customer();
      jQuery("#customer").modal("hide");
      this.alertifyService.success(data);
      this.clearFormGroup(this.customerAddForm);

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
      if (key == "customerId")
        group.get(key).setValue(0);
      else if (key == "isDeleted")
        group.get(key).setValue(false);
    });
  }
  deleteCustomer(id: number) {

    this.customerService.deleteCustomer(id).subscribe(data => {
      this.alertifyService.success(data.toString());
      var index = this.customerList.findIndex(x => x.customerId == id);
      this.customerList[index].isDeleted = true;
      this.customerList=this.customerList.filter(x=>x.isDeleted !=true)
      this.dataSource = new MatTableDataSource(this.customerList);
			this.configDataTable();
    });
} 
  


 getCustomerById(id: number){
      this.clearFormGroup(this.customerAddForm);
      this.customerService.getCustomerById(id).subscribe(data=>{
        this.customer=data;
        this.customerAddForm.patchValue(data);
      })
    }
}
