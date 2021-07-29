sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"./EmployeeController"
], function (Controller, MessageToast, MessageBox, JSONModel, EmployeeController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.employee.EmployeeEdit", {
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("employeeEditRoute").attachMatched(this._onRouteMatched, this);
			
			EmployeeController.initializeGenderComboBox(this.getView().byId("genderComboBox"),
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function (oEvent) {
			//Query employee data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			EmployeeController.queryEmployeesByWebService(this.queryEmployeesCallback, this, true);
			this.resetUIElements();
    	},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(this.getView().byId("employeeComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("employeeEdit.noEmployeeSelected"));
				return;
			}
			
			if(this.getView().byId("genderComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("employeeEdit.noGenderSelected"));
				return;
			}
			
			EmployeeController.saveEmployeeByWebService(this.getView().getModel("selectedEmployee"), this.saveEmployeeCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("startPageRoute");	
		},
		
		
		/**
		 * Handles the press-event of the salaryData button.
		 */
		onSalaryPressed : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var employeeId = this.getView().byId("employeeComboBox").getSelectedKey();
			
			//No employee selected
			if(employeeId == "") {
				MessageBox.error(oResourceBundle.getText("employeeEdit.noEmployeeSelected"));
				return;
			}
			
			oRouter.navTo("employeeSalaryEditRoute", {"employeeId" : employeeId});
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
		},
		
		
		/**
		 * Callback function of the queryEmployees RESTful WebService call in the EmployeeController.
		 */
		queryEmployeesCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("employeeEdit.dataLoaded"));
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(oReturnData.message[0].text);
			}
				                                                                
			oCallingController.getView().setModel(oModel, "employees");
		},
		
		
		/**
		 * Callback function of the saveEmployee RESTful WebService call in the EmployeeController.
		 */
		saveEmployeeCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					//Updates the data source of the ComboBox with the new employee data.
					EmployeeController.queryEmployeesByWebService(oCallingController.queryEmployeesCallback, oCallingController, false);
					oCallingController.resetUIElements();
					MessageToast.show(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'I') {
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
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("employeeComboBox").setSelectedItem(null);
			
			this.getView().byId("idInput").setValue("");
			this.getView().byId("firstNameInput").setValue("");
			this.getView().byId("lastNameInput").setValue("");
			this.getView().byId("genderComboBox").setSelectedItem(null);

		}
	});
});