import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { Dish } from "../shared/dish";
import { Params, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { DishService } from "../services/dish.service";
import { switchMap } from "rxjs/operators";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Comment } from "../shared/comment";
import {visibility,flyInOut,expand} from '../animations/app.animation';

@Component({
  selector: "app-dishdetail",
  templateUrl: "./dishdetail.component.html",
  styleUrls: ["./dishdetail.component.scss"],
  host:{
    '[@flyInOut]':'true',
    'style':'display: block;'
  },
  animations:[flyInOut(),visibility(),expand()]
})
export class DishdetailComponent implements OnInit {
  dish: Dish;
  errMess:string;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm: FormGroup;
  comment: Comment;
  dishcopy:Dish;
  visibility='shown';

  @ViewChild("fform") commentFormDirective;

  formErrors = {
    author: "",
    rating: "",
    comment: "",
  };

  validationMessages = {
    author: {
      required: "Name is required.",
      minlength: "Name must be atleast 2 characters long.",
    },
    rating: {
      required: "Rating is required.",
    },
    comment: {
      required: "Comment is required.",
    },
  };

  formatLabel(value: number | null) {
    if (!value) {
      return 1;
    }
    if (value > 5) {
      return Math.round(value / 5);
    }
    return value;
  }

  constructor(
    private dishService: DishService,
    private location: Location,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.dishService.getDishIds().subscribe((dishIds) => {
      this.dishIds = dishIds;
    });
    this.route.params
      .pipe(
        switchMap((params: Params) => {
          this.visibility='hidden';
          return this.dishService.getDish(params["id"]);
        }
      ))
      .subscribe((dish) => {
        this.dish = dish;
        this.dishcopy=dish;
        this.setPrevNext(dish.id);
        this.visibility='shown';
      },errmess=>this.errMess=<any>errmess);
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[
      (this.dishIds.length + index - 1) % this.dishIds.length
    ];
    this.next = this.dishIds[
      (this.dishIds.length + index + 1) % this.dishIds.length
    ];
  }

  goBack(): void {
    this.location.back();
  }

  createForm() {
    this.commentForm = this.fb.group({
      author: ["", [Validators.required, Validators.minLength(2)]],
      rating: [5, Validators.required],
      comment: ["", Validators.required],
    });

    this.commentForm.valueChanges.subscribe((data) =>
      this.onValueChanged(data)
    );
    this.onValueChanged();
  }

  onSubmit() {
    let d = new Date();
    let n = d.toISOString();
    this.comment = this.commentForm.value;
    this.comment.date = n;
    this.dishcopy.comments.push(this.comment);
    this.dishService.putDish(this.dishcopy).subscribe(dish=>{
      this.dish=dish;
      this.dishcopy=dish;
    },errmess=>{
      this.dish=null;
      this.dishcopy=null;
      this.errMess=<any>errmess;
    })
    this.commentForm.reset({
      author: "",
      rating: 5,
      comment: "",
    });
    this.commentFormDirective.resetForm();
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) {
      return;
    }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        this.formErrors[field] = "";
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + " ";
            }
          }
        }
      }
    }
  }
}
