import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Product } from './models/product';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ProductService } from './services/product.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertifyService } from './../../../services/Alertify.service';
import { AuthService } from './../login/services/Auth.service';
import { environment } from './../../../../../environments/environment';
declare var jQuery: any;

@Component({
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit,AfterViewInit {
    dataSource: MatTableDataSource<any>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
    displayedColumns:string[]=["productId","productName","productColor","productSize","isDeleted","update","delete"]

    product:Product;
    productList:Product[];
    dropdownSettings:IDropdownSettings;
    
    productId:number;

  constructor(
    private productService:ProductService,
    private formBuilder:FormBuilder,
    private alertifyService:AlertifyService,
    private authService:AuthService
  ) { }
    ngAfterViewInit(): void {
        this.getProductList();
    }

  ngOnInit(): void {
    this.createProductAddForm();
    this.dropdownSettings=environment.getDropDownSetting;
  }

  productAddForm:FormGroup;

  createProductAddForm(){
    this.productAddForm=this.formBuilder.group({
        productId:[0],
        productName: [" ",Validators.required],
        productColor: ["",Validators.required],
        productSize: [""],
        isDeleted:[false]
    })
  }
  save(){
    if(this.productAddForm.valid){
      this.product=Object.assign({},this.productAddForm.value)
      if(this.product.productId==0)
        this.addProduct();
        else
        this.updateProduct();
    }
  }

  addProduct(){
    this.productService.addProduct(this.product).subscribe(data=>{
      this.getProductList();
      this.product=new Product();
      jQuery("#product").modal("hide");
      this.alertifyService.success(data);
      this.clearFormGroup(this.productAddForm)
    })
  }

  getProductList(){
    this.productService.getProductList().subscribe(data=>{
      this.productList=data;
      this.dataSource=new MatTableDataSource(data);
    })
  }

  updateProduct(){
    this.productService.updateProduct(this.product).subscribe(data=>{
      var index=this.productList.findIndex(x=>x.productId==this.product.productId);
      this.productList[index]=this.product;
      this.dataSource=new MatTableDataSource(this.productList);
      this.configDataTable();
      this.product=new Product();
      jQuery('#product').modal("hide");
      this.alertifyService.success(data);
      this.clearFormGroup(this.productAddForm);
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
      if (key == "productId")
        group.get(key).setValue(0);
      else if (key == "isDeleted")
        group.get(key).setValue(false);
    });
  }


  deleteProduct(id: number) {

    this.productService.deleteProduct(id).subscribe(data => {
      this.alertifyService.success(data.toString());
      var index = this.productList.findIndex(x => x.productId == id);
      this.productList[index].isDeleted = true;
      this.dataSource = new MatTableDataSource(this.productList);
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

  getProductById(id:number){
    this.clearFormGroup(this.productAddForm);
    this.productService.getProductById(id).subscribe(data=>{
      this.product=data;
      this.productAddForm.patchValue(data);
    })
  }

}
