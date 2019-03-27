import { Directive, SimpleChanges, OnChanges, OnInit, Injector, ElementRef, Input, Renderer2, HostListener } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
  selector: '[ng-tdv]'
})
export class NgTdvDirective implements OnChanges, OnInit {

  /** NgModel for getting changes */
  @Input("ngModel") _model: NgModel;
  @Input("ng-tdv") _validationKey: string;

  public _option: any;
  public _valid: boolean = true;
  public _mouseenter: boolean = false;

  private _value:any;
  public _div: any;
  public _tooltipDiv: any;
  public _errorText: string = "";
  public _defaultErrorText: string = "This field is required";

  public _result = { fieldName: "", isValid: true, validationSummary: "" };

  constructor(
    public _injector: Injector,
    public _el: ElementRef,
    public _renderer: Renderer2,
    public _modelObj: NgModel
  ) {
    this._modelObj.control['ngTdvValidator'] = this;
    this._div = this._renderer.createElement("div");
    this._tooltipDiv = this._renderer.createElement("div");
  }

  public ngOnInit(): void {
  }

  public ngOnChanges(_changes_: SimpleChanges): void {
    this._value = _changes_._model.currentValue;
    if (!_changes_._model.firstChange) {
      this.validator();
    }
    else {
      this.prepareValidationMsgs();
    }
  }

  public prepareValidationMsgs() {
    try {
      // Get validatoion option's object string from ***Form*** & get the object for this element
      let _validateOption_ = this._el.nativeElement.closest("form").getAttribute("ng-tdv-option");
      this._option = this._injector["view"].component[_validateOption_][this._validationKey];
    } catch (error) {
      this._option = null;
    }
    this.decorateElement();
  }

  public _isUndefinedOrNull(): boolean {
    return (this._option === undefined || this._option === null);
  }

  public validator() {
    this.callValidation();

  }

  public callValidation(): any {
    this._errorText = "";
    this._valid = true;
    const _element_ = this._el.nativeElement;
    if (!this._isUndefinedOrNull()) {
      if (this._value !== undefined && this._value !== null && this._value.toString().length > 0) {
        if (this.isEmail(_element_) || this._option.hasOwnProperty("email")) {
          this._valid = (this._valid && this.validateEmail(this._option["email"]));
        }
        if (this._option.hasOwnProperty("size")) {
          this._valid = (this._valid && this.sizeValidator(this._option["size"]));
        }
        if (this._option.hasOwnProperty("range")) {
          this._valid = (this._valid && this.rangeValidator(this._option["range"]));
        }
        if (this._option.hasOwnProperty("pattern")) {
          this._valid = (this._valid && this.patternValidator(this._option["pattern"]));
        }
      }
      else if (this._option.hasOwnProperty("required")) {
        this._valid = (this._valid && this.requiredValidator(this._option["required"]));
      }
      if (this._option.hasOwnProperty("custom")) {
        this._valid = (this._valid && this.customValidator(this._option["custom"]));

      }

      this.setValidity();
    }
    this._result.fieldName = this._validationKey;
    this._result.isValid = this._valid;
    this._result.validationSummary = this._errorText;
    return this._result;
  }

  public resetValidation() {
    this._valid = true;
    this.removeError();
  }

  public setValidity() {
    if (!this._valid) {
      this.setError();
    }
    else {
      this.removeError();
    }

  }

  public setError() {
    this._modelObj.control.setErrors({ 'incorrect': true });
    this.showValidationMessage();
  }

  public removeError() {
    this._modelObj.control.setErrors(null);
    this.removeValidationTooltip();
    this.removeBorder();
  }

  public showValidationMessage() {
    this.addValidationTooltip();
    this.addBorder();
  }

  public addValidationTooltip() {
    // this._el.nativeElement.previousElementSibling.getElementsByClassName("tooltip-inner")[0].innerText = this._errorText;
    this._renderer.setProperty(this._tooltipDiv, "innerText", this._errorText);
    if (this._mouseenter) this._renderer.addClass(this._div, "show");
  }

  public removeValidationTooltip() {
    this._renderer.removeClass(this._div, "show");
  }

  public addBorder() {
    this._renderer.setStyle(this._el.nativeElement, "border", "1px solid red");
  }

  public removeBorder() {
    this._renderer.removeStyle(this._el.nativeElement, "border");
  }

  public decorateElement() {

    this._renderer.addClass(this._div, "tooltip");
    this._renderer.addClass(this._div, "fade");
    this._renderer.addClass(this._div, "bs-tooltip-top");
    this._renderer.setStyle(this._div, "bottom", "34px");
    this._renderer.setStyle(this._div, "top", "initial");
    this._renderer.setStyle(this._div, "right", "0");
    this._renderer.setStyle(this._div, "pointer-events", "none");
    const _arrowDiv_ = this._renderer.createElement("div");
    this._renderer.addClass(_arrowDiv_, "arrow");
    this._renderer.setStyle(_arrowDiv_, "left", "50%");
    this._renderer.setStyle(_arrowDiv_, "transform", "translateX(-50%)");
    const _tooltipText_ = (this._errorText) ? this._errorText : this._defaultErrorText;
    this._renderer.addClass(this._tooltipDiv, "tooltip-inner");
    this._renderer.setProperty(this._tooltipDiv, "innerText", _tooltipText_);
    this._renderer.appendChild(this._div, _arrowDiv_);
    this._renderer.appendChild(this._div, this._tooltipDiv);
    this._renderer.insertBefore(this._el.nativeElement.parentNode, this._div, this._el.nativeElement);
  }

  @HostListener("mouseenter")
  showTootip() {
    this._mouseenter = true;
    if (!this._valid) {
      this._renderer.addClass(this._div, "show");
    }
  }

  @HostListener("mouseleave")
  hideTooltip() {
    this._mouseenter = false;
    this._renderer.removeClass(this._div, "show");
  }


  public _getTime() { }
  public setResult() { }
  public callGridValidationGrps() { }

  public isEmail(_element) {
    return _element['type'] === 'email';
  }

  public isInput(_element) {
    return _element['nodeName'] === 'INPUT' || _element['nodeName'] === 'SELECT' || _element['nodeName'] === 'TEXTAREA';
  }

  public stringMinLength(_sizeOptions_, _result_) {
    if (_sizeOptions_.hasOwnProperty("min") && (this._value.toString().length < _sizeOptions_["min"])) {
      _result_ = false;
      this._errorText = _sizeOptions_.message;
    }
    return _result_
  }
  public stringMaxLength(_sizeOptions_, _result_) {
    if (_sizeOptions_.hasOwnProperty("max") && (this._value.toString().length > _sizeOptions_["max"])) {
      _result_ = false;
      this._errorText = _sizeOptions_.message;
    }
    return _result_
  }

  public validateEmail(_emailOptions:any={}) {
    let _result_: boolean;
    var re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    var patt = new RegExp(re);
    _result_ = patt.test(this._value);
    if (!_result_) {
      this._errorText = _emailOptions.hasOwnProperty("message") ? _emailOptions.message : "Not a valid email";
    }
    return _result_;
  }

  public sizeValidator(_sizeOptions_) {
    let _result_ = true;

    _result_ = this.stringMinLength(_sizeOptions_, _result_);
    _result_ = this.stringMaxLength(_sizeOptions_, _result_);

    return _result_;
  }

  public rangeValidator(_rangeOptions_) {
    let _result_ = true;
    let _value_ = this._value;
    try {
      if (typeof _value_ === "string") {
        _value_ = parseFloat(_value_);
      }

      const _dataRange_ = _rangeOptions_.hasOwnProperty("value")?_rangeOptions_.value:"";

      if ((typeof _value_ === "number") && (!isNaN(_value_))) {
        let range_array = _dataRange_.split(',');

        if (range_array.length === 2) {
          var minRange = parseFloat(range_array[0]);
          var maxRange = parseFloat(range_array[1]);

          if (minRange != null && _value_ < minRange) {
            this._errorText = _rangeOptions_.message;
            return _result_ = false;
          }
          if (maxRange != null && _value_ > maxRange) {
            this._errorText = _rangeOptions_.message;
            return _result_ = false;
          }
        }
        else {
          var range = parseFloat(_dataRange_);
          if ((typeof range === "number") && (!isNaN(range))) {
            if (_value_ < range) {
              this._errorText = _rangeOptions_.message;
              _result_ = false;
            }
          }
        }
      } else {
        this._errorText = _rangeOptions_.message;
        _result_ = false;
      }
    } catch (e) {
      this._errorText = e.message;
      _result_ = false;
    }
    return _result_;
  }

  public patternValidator(_patternOptions) {
    let _pattern_ = _patternOptions['match']
    let patt = new RegExp(_pattern_, "g");
    let _result_ = patt.test(this._value);
    if (!_result_) {
      this._errorText = _patternOptions.hasOwnProperty("message") ? _patternOptions.message : "Doesn't match!";
    }
    return _result_;
  }

  public customValidator(_validationOptions) {
    let fn:Function = _validationOptions.method;
    let _result_ = fn();
    if (!_result_) {
      this._errorText = _validationOptions.hasOwnProperty("message") ? _validationOptions.message : this._defaultErrorText;
    }
    return _result_;
  }



  public requiredValidator(_requiredOptions_): boolean {
    let _result_ = true;
    if (this._value !== undefined && this._value !== null && this._value.toString().length > 0) {
    }
    else {
      _result_ = false;
      this._errorText = _requiredOptions_.hasOwnProperty("message") ? _requiredOptions_.message : this._defaultErrorText;
    }
    return _result_
  }

  /** This method was written for testing purpuse only 
   *   #Result: Test passes for calling from outside
   */



}
