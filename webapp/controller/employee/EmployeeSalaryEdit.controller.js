sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"../../model/formatter",
	"./EmployeeController"
], function (Controller, MessageToast, JSONModel, formatter, EmployeeController) {
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
			
			EmployeeController.queryEmployeeById(this.queryEmployeeByIdCallback, this, sEmployeeId);
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
			if(this.getView().byId("monthlySalaryInput").getValue() == "")
				return;
			
			this.updateSalaryLastChange();
			EmployeeController.saveEmployeeByWebService(new JSONModel(this.getView().getModel().getProperty("/employee/data")),
				this.saveEmployeeCallback, this);
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
		 * Callback function of the queryEmployeeById RESTful WebService call in the EmployeeController.
		 */
		queryEmployeeByIdCallback : function(oReturnData, oCallingController) {
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oModel = new JSONModel();

			oModel.setData({employee : oReturnData});
			oCallingController.getView().setModel(oModel);
			
			EmployeeController.initializeSalaryTitleWithName(oReturnData.data, oCallingController, 
				oCallingController.getView().byId("toolbarTitle"));
				
			oCallingController.initializeSalaryData(oCallingController);
			
			if(oReturnData.data != null) {
				MessageToast.show(oResourceBundle.getText("employeeSalaryEdit.dataLoaded"));
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(oReturnData.message[0].text);
			}				                                                              
		},
		
		
		/**
		 * Callback function of the saveEmployee RESTful WebService call in the EmployeeController.
		 */
		saveEmployeeCallback : function(oReturnData) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
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
		 * Checks if the given employee has salary data already defined. If not, the model is initialized to host newly defined salary data.
		 */
		initializeSalaryData : function (oCallingController) {
			var oSalaryData, sEmployeeId;
			
			oSalaryData = oCallingController.getView().getModel().getProperty("/employee/data/salaryData");
			if(oSalaryData != null)
				return;
			
			sEmployeeId = oCallingController.getView().getModel().getProperty("/employee/data/id");
			oCallingController.getView().getModel().setProperty("/employee/data/salaryData", {id: sEmployeeId, monthlySalary: 0, salaryLastChange: null});
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