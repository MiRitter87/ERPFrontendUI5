sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/Title",
	"../../model/formatter"
], function (Controller, MessageToast, JSONModel, Title, formatter) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.employee.EmployeeSalaryEdit", {
		formatter: formatter,
		
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {
			var oRouter, oView, oMessageManager;
			
			//Initialize routing with callback on routeMatched.
			oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("employeeSalaryEditRoute").attachMatched(this.onRouteMatched, this);
			
			//Initialize message manager for input form validation.
			oView = this.getView();
			oMessageManager = sap.ui.getCore().getMessageManager();
			oView.setModel(oMessageManager.getMessageModel(), "message");
			oMessageManager.registerObject(oView, true);
		},
		
		/**
		 * Handles additional tasks to be performed when the user navigates to this view.
		 */
		onRouteMatched : function (oEvent) {
			var oArguments = oEvent.getParameter("arguments");
    		var sEmployeeId = oArguments.employeeId;
			
			this.queryEmployeeWebService(sEmployeeId, "employeeSalaryEdit.dataLoaded");
		},
		
		
		/**
		 * Handles a press of the back-button in the header.
		 */
		onBackPress : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("employeeEditRoute");	
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			this.updateSalaryLastChange();
			this.saveEmployeeByWebService();
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			//Query WebService and overwrite the users changes with the current backend state
			var sEmployeeId = this.getView().getModel().getProperty("/employee/data/id");
			this.queryEmployeeWebService(sEmployeeId, "employeeSalaryEdit.originalStateRestored");
		},
		
		
		/**
		 * Updates the date and time of the last salary change.
		 */
		updateSalaryLastChange : function () {
			var iLastChange = new Date().getTime();
			
			this.getView().getModel().setProperty("/employee/data/salaryData/salaryLastChange", iLastChange);
		},
		
		
		/**
		 * Queries the employee WebService. If the call is successful, the model is updated with the employee data.
		 */
		queryEmployeeWebService : function(employeeId, successMessageKey) {
			var webServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var queryUrl = webServiceBaseUrl + "/" + employeeId;
			var oModel = new JSONModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : queryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					oModel.setData({employee : data}); // not aData
					this.initializeTitleWithName();
					this.initializeSalaryData();
					
					if(data.data != null) {
						MessageToast.show(oResourceBundle.getText(successMessageKey));
					}
					else {
						if(data.message != null)
							MessageToast.show(data.message[0].text);
					}
				},
				context : this
			});                                                                 
			
			this.getView().setModel(oModel);
		},
		
		
		/**
		 * Updates changes of the employee data using the WebService.
		 */
		saveEmployeeByWebService : function() {
			var webServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var queryUrl = webServiceBaseUrl + "/";
			var employeeModel = new JSONModel(this.getView().getModel().getProperty("/employee/data"));
			var jsonData = employeeModel.getJSON();
			
			//Use "PUT" to update an existing resource.
			var aData = jQuery.ajax({
				type : "PUT", 
				contentType : "application/json", 
				url : queryUrl,
				data : jsonData, 
				success : function(data,textStatus, jqXHR) {
					if(data.message != null) {
						if(data.message[0].type == 'S') {
							MessageToast.show(data.message[0].text);
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
		 * Initializes the title with the name of the employee whose salary data are being displayed.
		 */
		initializeTitleWithName : function () {
			var oResourceBundle, oTitleControl, sFirstName, sLastName, sTitleText;
						
			if(this.getView().getModel().getProperty("/employee/data") != null) {
				sFirstName = this.getView().getModel().getProperty("/employee/data/firstName");
				sLastName = this.getView().getModel().getProperty("/employee/data/lastName");
			}
			else {
				sFirstName = "";
				sLastName = "";
			}
			
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			oTitleControl = this.getView().byId("toolbarTitle");
			sTitleText = oResourceBundle.getText("employeeSalaryEdit.headerWithName", [sFirstName, sLastName]);
			oTitleControl.setText(sTitleText);
		},
		
		
		/**
		 * Checks if the given employee has salary data already defined. If not, the model is initialized to host newly defined salary data.
		 */
		initializeSalaryData : function () {
			var salaryData;
			var employeeId;
			
			salaryData = this.getView().getModel().getProperty("/employee/data/salaryData");
			if(salaryData != null)
				return;
			
			employeeId = this.getView().getModel().getProperty("/employee/data/id");
			this.getView().getModel().setProperty("/employee/data/salaryData", {id: employeeId, monthlySalary: 0, salaryLastChange: null});
		},
		
		
		/**
		 * Checks if an employee with the given ID exists and returns true if the employee exists; false otherwise.
		 */
		employeeExistsFormatter : function (employeeId) {
			if(employeeId == null)
				return false;
			else
				return true;
		}
	});
});