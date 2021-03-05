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
			this.initializeEmployeeModel();
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function (oEvent) {
			this.getView().byId("genderComboBox").setSelectedItem(null);
    	},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			if(this.getView().byId("genderComboBox").getSelectedKey() == "") {
				this.showMessageOnUndefinedGender();
				return;
			}
			
			this.saveEmployeeByWebService();
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
			this.getView().setModel(employeeModel);
		},
		
		
		/**
		 * Saves the employee defined in the input form by using the RESTful WebService.
		 */
		saveEmployeeByWebService : function () {
			var webServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var queryUrl = webServiceBaseUrl + "/";
			var employeeModel = this.getView().getModel();
			var jsonData = employeeModel.getJSON();
			
			//Use "POST" to create a resource.
			var aData = jQuery.ajax({
				type : "POST", 
				contentType : "application/json", 
				url : queryUrl,
				data : jsonData, 
				success : function(data,textStatus, jqXHR) {
					if(data.message != null) {
						if(data.message[0].type == 'S') {
							MessageToast.show(data.message[0].text);
							this.initializeEmployeeModel();	//Resets the input fields to the initial state.
						}
						
						if(data.message[0].type == 'E') {
							MessageBox.error(data.message[0].text);
						}
						
						if(data.message[0].type == 'W') {
							MessageBox.warning(data.message[0].text);
						}
					}
				},
				context : this
			});   
		},
		
		
		/**
		 * Displays a message in case the gender has not been selected.
		 */
		showMessageOnUndefinedGender : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			MessageBox.error(oResourceBundle.getText("employeeCreate.noGenderSelected"));
		}
	});

});