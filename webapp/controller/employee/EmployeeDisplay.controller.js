sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"./EmployeeController"
], function (Controller, MessageToast, MessageBox, JSONModel, EmployeeController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.employee.EmployeeDisplay", {
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {			
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("employeeDisplayRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query employee data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			EmployeeController.queryEmployeesByWebService(this.queryEmployeesCallback, this);
			this.resetUIElements();
    	},
		
		
		/**
		 * Handles the press-event of the salaryData button.
		 */
		onSalaryPressed : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var salaryData = this.getEmployeeSalaryData();
			var employeeId = this.getView().byId("employeeComboBox").getSelectedKey();
			
			//No employee selected
			if(employeeId == "") {
				MessageBox.error(oResourceBundle.getText("employeeDisplay.noEmployeeSelected"));
				return;
			}
			
			//Employee has no salary defined
			if(salaryData == null) {
				MessageBox.error(oResourceBundle.getText("employeeDisplay.noSalaryDataExist"));
				return;
			}
			
			oRouter.navTo("employeeSalaryDisplayRoute", {"employeeId" : employeeId});
		},
		
		
		/**
		 * Handles the selection of an item in the employee ComboBox.
		 */
		onEmployeeSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oEmployees = this.getView().getModel("employees");
			var oEmployee;
			var oEmployeeModel = new JSONModel();
			
			if(oSelectedItem == null)
				return;
				
			oEmployee = EmployeeController.getEmployeeById(oSelectedItem.getKey(), oEmployees.oData.employee);
			oEmployeeModel.setData(oEmployee);
			
			//Set the model of the view according to the selected business partner to allow binding of the UI elements.
			this.getView().setModel(oEmployeeModel, "selectedEmployee");
			
			//Determine and set the localized gender name.
			this.setLocalizedGender();
		},

		
		/**
		 * Callback function of the queryEmployees RESTful WebService call in the EmployeeController.
		 */
		queryEmployeesCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				MessageToast.show(oResourceBundle.getText("employeeDisplay.dataLoaded"));
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(oReturnData.message[0].text);
			}				                                                                
			
			oCallingController.getView().setModel(oModel, "employees");
		},
		
		
		/**
		 * Determines and sets the localized text of the selected employees gender.
		 */
		setLocalizedGender : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oModel = this.getView().getModel("selectedEmployee");
			var sGenderText = "", sGender = "";
			
			//1. Get the gender of the selected employee.
			if(oModel != null)
				sGender = oModel.getProperty("/gender");
			
			//2. Determine the localized text of the gender.
			if(sGender == "MALE")
				sGenderText = oResourceBundle.getText("employee.gender.male");
			else if(sGender == "FEMALE")
				sGenderText = oResourceBundle.getText("employee.gender.female");
			
			//3. Apply the text to the gender label.
			this.getView().byId("genderText").setText(sGenderText);
		},
		
		
		/**
		 * Gets the salary data of the selected employee.
		 */
		getEmployeeSalaryData : function () {
			var salaryData = this.getView().getModel("selectedEmployee").getProperty("/salaryData");
			return salaryData;
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("employeeComboBox").setSelectedItem(null);

			this.getView().byId("idText").setText("");
			this.getView().byId("firstNameText").setText("");
			this.getView().byId("lastNameText").setText("");
			this.getView().byId("genderText").setText("");
		}
	});

});