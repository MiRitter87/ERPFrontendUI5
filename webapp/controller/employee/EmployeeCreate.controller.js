sap.ui.define([
	"sap/ui/core/mvc/Controller", 
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"./EmployeeController"
], function (Controller, MessageToast, MessageBox, JSONModel, EmployeeController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.employee.EmployeeCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("employeeCreateRoute").attachMatched(this._onRouteMatched, this);
			
			EmployeeController.initializeGenderComboBox(this.getView().byId("genderComboBox"),
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			this.initializeEmployeeModel();
			this.resetUIElements();
    	},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			if(this.getView().byId("genderComboBox").getSelectedKey() == "") {
				this.showMessageOnUndefinedGender();
				return;
			}
			
			EmployeeController.createEmployeebyWebService(this.getView().getModel("newEmployee"), this.createEmployeeCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			this.initializeEmployeeModel();
			oRouter.navTo("startPageRoute");
		},
		
		
		/**
		 * Initializes the model to which the UI controls are bound.
		 */
		initializeEmployeeModel : function () {
			var employeeModel = new JSONModel();
			
			employeeModel.loadData("model/employee/employeeCreate.json");
			this.getView().setModel(employeeModel, "newEmployee");
		},
		
		
		/**
		 * Callback function of the createEmployee RESTful WebService call in the EmployeeController.
		 */
		createEmployeeCallback : function (oReturnData, oCalingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					oCalingController.initializeEmployeeModel();	//Resets the input fields to the initial state.
				}
				
				if(oReturnData.message[0].type == 'E') {
					MessageBox.error(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'W') {
					MessageBox.warning(oReturnData.message[0].text);
				}
			}
		},
		
		
		/**
		 * Displays a message in case the gender has not been selected.
		 */
		showMessageOnUndefinedGender : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			MessageBox.error(oResourceBundle.getText("employeeCreate.noGenderSelected"));
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("genderComboBox").setSelectedItem(null);
		},
	});
});