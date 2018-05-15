/*
 * jQuery wizard plug-in 3.0.5
 *
 *
 * Copyright (c) 2011 Jan Sundman (jan.sundman[at]aland.net)
 *
 * http://www.thecodemine.org
 *
 * Licensed under the MIT licens:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 */
(function ( a ) {
	a.widget( "ui.formwizard", {_init: function () {
		var e = this;
		var f = this.options.formOptions.success;
		var d = this.options.formOptions.complete;
		var b = this.options.formOptions.beforeSend;
		var g = this.options.formOptions.beforeSubmit;
		var c = this.options.formOptions.beforeSerialize;
		this.options.formOptions = a.extend( this.options.formOptions, {success: function ( h, j, i ) {
			if ( f ) {
				f( h, j, i )
			}
			if ( e.options.formOptions && e.options.formOptions.resetForm || !e.options.formOptions ) {
				e._reset()
			}
		}, complete: function ( h, i ) {
			if ( d ) {
				d( h, i )
			}
			e._enableNavigation()
		}, beforeSubmit: function ( i, k, j ) {
			if ( g ) {
				var h = g( i, k, j );
				if ( !h ) {
					e._enableNavigation()
				}
				return h
			}
		}, beforeSend: function ( i ) {
			if ( b ) {
				var h = b( i );
				if ( !h ) {
					e._enableNavigation()
				}
				return h
			}
		}, beforeSerialize: function ( j, i ) {
			if ( c ) {
				var h = c( j, i );
				if ( !h ) {
					e._enableNavigation()
				}
				return h
			}
		}} );
		this.steps = this.element.find( ".step" ).hide();
		this.firstStep = this.steps.eq( 0 ).attr( "id" );
		this.activatedSteps = new Array();
		this.isLastStep = false;
		this.previousStep = undefined;
		this.currentStep = this.steps.eq( 0 ).attr( "id" );
		this.nextButton = this.element.find( this.options.next ).click( function () {
			return e._next()
		} );
		this.nextButtonInitinalValue = this.nextButton.val();
		this.nextButton.val( this.options.textNext );
		this.backButton = this.element.find( this.options.back ).click( function () {
			e._back();
			return false
		} );
		this.backButtonInitinalValue = this.backButton.val();
		this.backButton.val( this.options.textBack );
		if ( this.options.validationEnabled && jQuery().validate == undefined ) {
			this.options.validationEnabled = false;
			if ( (window.console !== undefined) ) {
				console.log( "%s", "validationEnabled option set, but the validation plugin is not included" )
			}
		} else {
			if ( this.options.validationEnabled ) {
				this.element.validate( this.options.validationOptions )
			}
		}
		if ( this.options.formPluginEnabled && jQuery().ajaxSubmit == undefined ) {
			this.options.formPluginEnabled = false;
			if ( (window.console !== undefined) ) {
				console.log( "%s", "formPluginEnabled option set but the form plugin is not included" )
			}
		}
		if ( this.options.disableInputFields == true ) {
			a( this.steps ).find( ":input:not('.wizard-ignore')" ).attr( "disabled", "disabled" )
		}
		if ( this.options.historyEnabled ) {
			a( window ).bind( "hashchange", undefined, function ( i ) {
				var h = i.getState( "_" + a( e.element ).attr( "id" ) ) || e.firstStep;
				if ( h !== e.currentStep ) {
					if ( e.options.validationEnabled && h === e._navigate( e.currentStep ) ) {
						if ( !e.element.valid() ) {
							e._updateHistory( e.currentStep );
							e.element.validate().focusInvalid();
							return false
						}
					}
					if ( h !== e.currentStep ) {
						e._show( h )
					}
				}
			} )
		}
		this.element.addClass( "ui-formwizard" );
		this.element.find( ":input" ).addClass( "ui-wizard-content" );
		this.steps.addClass( "ui-formwizard-content" );
		this.backButton.addClass( "ui-formwizard-button ui-wizard-content" );
		this.nextButton.addClass( "ui-formwizard-button ui-wizard-content" );
		if ( !this.options.disableUIStyles ) {
			this.element.addClass( "ui-helper-reset ui-widget ui-widget-content ui-helper-reset ui-corner-all" );
			this.element.find( ":input" ).addClass( "ui-helper-reset ui-state-default" );
			this.steps.addClass( "ui-helper-reset ui-corner-all" );
			this.backButton.addClass( "ui-helper-reset ui-state-default" );
			this.nextButton.addClass( "ui-helper-reset ui-state-default" )
		}
		this._show( undefined );
		return a( this )
	}, _next: function () {
		if ( this.options.validationEnabled ) {
			if ( !this.element.valid() ) {
				this.element.validate().focusInvalid();
				return false
			}
		}
		if ( this.options.remoteAjax != undefined ) {
			var c = this.options.remoteAjax[this.currentStep];
			var e = this;
			if ( c !== undefined ) {
				var f = c.success;
				var d = c.beforeSend;
				var b = c.complete;
				c = a.extend( {}, c, {success: function ( g, h ) {
					if ( (f !== undefined && f( g, h )) || (f == undefined) ) {
						e._continueToNextStep()
					}
				}, beforeSend: function ( g ) {
					e._disableNavigation();
					if ( d !== undefined ) {
						d( g )
					}
					a( e.element ).trigger( "before_remote_ajax", {currentStep: e.currentStep} )
				}, complete: function ( h, g ) {
					if ( b !== undefined ) {
						b( h, g )
					}
					a( e.element ).trigger( "after_remote_ajax", {currentStep: e.currentStep} );
					e._enableNavigation()
				}} );
				this.element.ajaxSubmit( c );
				return false
			}
		}
		return this._continueToNextStep()
	}, _back: function () {
		if ( this.activatedSteps.length > 0 ) {
			if ( this.options.historyEnabled ) {
				this._updateHistory( this.activatedSteps[this.activatedSteps.length - 2] )
			} else {
				this._show( this.activatedSteps[this.activatedSteps.length - 2], true )
			}
		}
		return false
	}, _continueToNextStep: function () {
		if ( this.isLastStep ) {
			for ( var b = 0; b < this.activatedSteps.length; b++ ) {
				this.steps.filter( "#" + this.activatedSteps[b] ).find( ":input" ).not( ".wizard-ignore" ).removeAttr( "disabled" )
			}
			if ( !this.options.formPluginEnabled ) {
				return true
			} else {
				this._disableNavigation();
				this.element.ajaxSubmit( this.options.formOptions );
				return false
			}
		}
		var c = this._navigate( this.currentStep );
		if ( c == this.currentStep ) {
			return false
		}
		if ( this.options.historyEnabled ) {
			this._updateHistory( c )
		} else {
			this._show( c, true )
		}
		return false
	}, _updateHistory: function ( b ) {
		var c = {};
		c["_" + a( this.element ).attr( "id" )] = b;
		a.bbq.pushState( c )
	}, _disableNavigation: function () {
		this.nextButton.attr( "disabled", "disabled" );
		this.backButton.attr( "disabled", "disabled" );
		if ( !this.options.disableUIStyles ) {
			this.nextButton.removeClass( "ui-state-active" ).addClass( "ui-state-disabled" );
			this.backButton.removeClass( "ui-state-active" ).addClass( "ui-state-disabled" )
		}
	}, _enableNavigation: function () {
		if ( this.isLastStep ) {
			this.nextButton.val( this.options.textSubmit )
		} else {
			this.nextButton.val( this.options.textNext )
		}
		if ( a.trim( this.currentStep ) !== this.steps.eq( 0 ).attr( "id" ) ) {
			this.backButton.removeAttr( "disabled" );
			if ( !this.options.disableUIStyles ) {
				this.backButton.removeClass( "ui-state-disabled" ).addClass( "ui-state-active" )
			}
		}
		this.nextButton.removeAttr( "disabled" );
		if ( !this.options.disableUIStyles ) {
			this.nextButton.removeClass( "ui-state-disabled" ).addClass( "ui-state-active" )
		}
	}, _animate: function ( g, c, f ) {
		this._disableNavigation();
		var b = this.steps.filter( "#" + g );
		var e = this.steps.filter( "#" + c );
		b.find( ":input" ).not( ".wizard-ignore" ).attr( "disabled", "disabled" );
		e.find( ":input" ).not( ".wizard-ignore" ).removeAttr( "disabled" );
		var d = this;
		b.animate( d.options.outAnimation, d.options.outDuration, d.options.easing, function () {
			e.animate( d.options.inAnimation, d.options.inDuration, d.options.easing, function () {
				if ( d.options.focusFirstInput ) {
					e.find( ":input:first" ).focus()
				}
				d._enableNavigation();
				f.apply( d )
			} );
			return
		} )
	}, _checkIflastStep: function ( b ) {
		this.isLastStep = false;
		if ( a( "#" + b ).hasClass( this.options.submitStepClass ) || this.steps.filter( ":last" ).attr( "id" ) == b ) {
			this.isLastStep = true
		}
	}, _getLink: function ( d ) {
		var c = undefined;
		var b = this.steps.filter( "#" + d ).find( this.options.linkClass );
		if ( b != undefined ) {
			if ( b.filter( ":radio,:checkbox" ).size() > 0 ) {
				c = b.filter( this.options.linkClass + ":checked" ).val()
			} else {
				c = a( b ).val()
			}
		}
		return c
	}, _navigate: function ( d ) {
		var c = this._getLink( d );
		if ( c != undefined ) {
			if ( (c != "" && c != null && c != undefined) && this.steps.filter( "#" + c ).attr( "id" ) != undefined ) {
				return c
			}
			return this.currentStep
		} else {
			if ( c == undefined && !this.isLastStep ) {
				var b = this.steps.filter( "#" + d ).next().attr( "id" );
				return b
			}
		}
	}, _show: function ( d ) {
		var b = false;
		var c = d !== undefined;
		if ( d == undefined || d == "" ) {
			this.activatedSteps.pop();
			d = this.firstStep;
			this.activatedSteps.push( d )
		} else {
			if ( a.inArray( d, this.activatedSteps ) > -1 ) {
				b = true;
				this.activatedSteps.pop()
			} else {
				this.activatedSteps.push( d )
			}
		}
		if ( this.currentStep !== d || d === this.firstStep ) {
			this.previousStep = this.currentStep;
			this._checkIflastStep( d );
			this.currentStep = d;
			var e = function () {
				if ( c ) {
					a( this.element ).trigger( "step_shown", a.extend( {isBackNavigation: b}, this._state() ) )
				}
			};
			this._animate( this.previousStep, d, e )
		}
	}, _reset: function () {
		this.element.resetForm();
		a( "label,:input,textarea", this ).removeClass( "error" );
		for ( var b = 0; b < this.activatedSteps.length; b++ ) {
			this.steps.filter( "#" + this.activatedSteps[b] ).hide().find( ":input" ).attr( "disabled", "disabled" )
		}
		this.activatedSteps = new Array();
		this.previousStep = undefined;
		this.isLastStep = false;
		if ( this.options.historyEnabled ) {
			this._updateHistory( this.firstStep )
		} else {
			this._show( this.firstStep )
		}
	}, _state: function ( c ) {
		var b = {settings: this.options, activatedSteps: this.activatedSteps, isLastStep: this.isLastStep, isFirstStep: this.currentStep === this.firstStep, previousStep: this.previousStep, currentStep: this.currentStep, backButton: this.backButton, nextButton: this.nextButton, steps: this.steps, firstStep: this.firstStep};
		if ( c !== undefined ) {
			return b[c]
		}
		return b
	}, show: function ( b ) {
		if ( this.options.historyEnabled ) {
			this._updateHistory( b )
		} else {
			this._show( b )
		}
	}, state: function ( b ) {
		return this._state( b )
	}, reset: function () {
		this._reset()
	}, next: function () {
		this._next()
	}, back: function () {
		this._back()
	}, destroy: function () {
		this.element.find( "*" ).removeAttr( "disabled" ).show();
		this.nextButton.unbind( "click" ).val( this.nextButtonInitinalValue ).removeClass( "ui-state-disabled" ).addClass( "ui-state-active" );
		this.backButton.unbind( "click" ).val( this.backButtonInitinalValue ).removeClass( "ui-state-disabled" ).addClass( "ui-state-active" );
		this.backButtonInitinalValue = undefined;
		this.nextButtonInitinalValue = undefined;
		this.activatedSteps = undefined;
		this.previousStep = undefined;
		this.currentStep = undefined;
		this.isLastStep = undefined;
		this.options = undefined;
		this.nextButton = undefined;
		this.backButton = undefined;
		this.formwizard = undefined;
		this.element = undefined;
		this.steps = undefined;
		this.firstStep = undefined
	}, update_steps: function () {
		this.steps = this.element.find( ".step" ).addClass( "ui-formwizard-content" );
		this.steps.not( "#" + this.currentStep ).hide().find( ":input" ).addClass( "ui-wizard-content" ).attr( "disabled", "disabled" );
		this._checkIflastStep( this.currentStep );
		this._enableNavigation();
		if ( !this.options.disableUIStyles ) {
			this.steps.addClass( "ui-helper-reset ui-corner-all" );
			this.steps.find( ":input" ).addClass( "ui-helper-reset ui-state-default" )
		}
	}, options: {historyEnabled: false, validationEnabled: false, validationOptions: undefined, formPluginEnabled: false, linkClass: ".link", submitStepClass: "submit_step", back: ":reset", next: ":submit", textSubmit: "Submit", textNext: "Next", textBack: "Back", remoteAjax: undefined, inAnimation: {opacity: "show"}, outAnimation: {opacity: "hide"}, inDuration: 400, outDuration: 400, easing: "swing", focusFirstInput: false, disableInputFields: true, formOptions: {reset: true, success: function ( b ) {
		if ( (window.console !== undefined) ) {
			console.log( "%s", "form submit successful" )
		}
	}, disableUIStyles: false}}} )
})( jQuery );
