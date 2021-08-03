sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"./EmployeeController"
], function (Controller, MessageToast, MessageBox, JSONModel, EmployeeController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.employee.EmployeeOverview", {
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("employeeOverviewRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query employee data every time a user navigates to this view. This assures that changes are being displayed in the table.
			EmployeeController.queryEmployeesByWebService(this.queryEmployeesCallback, this, true);
    	},
		
		
		/**
		 * Handles the press-event of the salary button.
		 */
		onSalaryPressed : function () {
			var oSalaryData, oResourceBundle, oRouter;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(this.isEmployeeSelected() == false) {
				MessageBox.error(oResourceBundle.getText("employeeOverview.noEmployeeSelected"));
				return;
			}
			
			oSalaryData = this.getSelectedEmployee().salaryData;
			
			if(oSalaryData == null) {
				MessageBox.error(oResourceBundle.getText("employeeOverview.noSalaryDataExist"));
				return;
			}
			
			oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("employeeSalaryDisplayRoute", {"employeeId" : oSalaryData.id});
		},
		
		
		/**
		 * Handles the press-event of the delete button.
		 */
		onDeletePressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(this.isEmployeeSelected() == false) {
				MessageBox.error(oResourceBundle.getText("employeeOverview.noEmployeeSelected"));
				return;
			}
			
			EmployeeController.deleteEmployeeByWebService(this.getSelectedEmployee(), this.deleteEmployeeCallback, this);
		},
		
		
		/**
		 * Callback function of the queryEmployees RESTful WebService call in the EmployeeController.
		 */
		queryEmployeesCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true) {
					MessageToast.show(oResourceBundle.getText("employeeOverview.dataLoaded"));							
				}
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(oReturnData.message[0].text);
			}                                                              
			
			oCallingController.getView().setModel(oModel, "employees");
		},
		
		
		/**
		 * Callback function of the deleteEmployee RESTful WebService call in the EmployeeController.
		 */
		deleteEmployeeCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					EmployeeController.queryEmployeesByWebService(oCallingController.queryEmployeesCallback, oCallingController, false);
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
		 * Formatter of the gender text in the table. Provides the localized text of a gender.
		 */
		genderTextFormatter : function (sGender) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			return EmployeeController.getLocalizedGenderText(sGender, oResourceBundle);
		},


		/**
		 * Checks if an employee has been selected.
		 */
		isEmployeeSelected : function () {
			if(this.getView().byId("employeeTable").getSelectedItem() == null)
				return false;
			else
				return true;
		},
		
		
		/**
		 * Gets the the selected employee.
		 */
		getSelectedEmployee : function () {
			var oListItem = this.getView().byId("employeeTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("employees");
			var oSelectedEmployee = oContext.getProperty(null, oContext);
			
			return oSelectedEmployee;
		}
	});
});