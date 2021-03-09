sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"./DepartmentController"
], function (Controller, MessageToast, MessageBox, JSONModel, DepartmentController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.department.DepartmentEdit", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("departmentEditRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query department data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			this.getView().setModel(new JSONModel());
			DepartmentController.queryDepartmentsByWebService(this.queryDepartmentsCallback, this, true);
			DepartmentController.queryEmployeesByWebService(this.queryEmployeesCallback, this, "ALL");
			
			this.getView().byId("departmentComboBox").setSelectedItem(null);
    	},
		
		
		/**
		 * Handles the selection of an item in the department ComboBox.
		 */
		onDepartmentSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oModel = this.getView().getModel();
			var oDepartments = oModel.oData.departments;
			var oDepartment;
			
			if(oSelectedItem == null)
				return;
			
			//Get the selected department from the array of all departments according to the code.
			for(var i = 0; i < oDepartments.data.department.length; i++) {
    			var oTempDepartment = oDepartments.data.department[i];
    			
				if(oTempDepartment.code == oSelectedItem.getKey()) {
					oDepartment = oTempDepartment;
				}
			}
			
			//Set the model of the view according to the selected department to allow binding of the UI elements.
			oModel.setData({departments:oDepartments, selectedDepartment : oDepartment}, true);
		},
		
		
		/**
		 * Handles the selection of an item in the head of department ComboBox.
		 */
		onHeadSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oModel = this.getView().getModel();
			var oSelectedDepartment = oModel.oData.selectedDepartment;
			var oEmployees = oModel.oData.employees;
			var oSelectedEmployee;
			
			if(oSelectedItem == null)
				return;
			
			//Get the selected employee from the array of all employees according to the id.
			for(var i = 0; i < oEmployees.data.employee.length; i++) {
    			var oTempEmployee = oEmployees.data.employee[i];
    			
				if(oTempEmployee.id == oSelectedItem.getKey()) {
					oSelectedEmployee = oTempEmployee;
				}
			}
			
			oSelectedDepartment.head = oSelectedEmployee;
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(this.getView().byId("departmentComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("departmentEdit.noDepartmentSelected"));
				return;
			}
			
			if(this.getView().byId("headComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("departmentEdit.noHeadSelected"));
				return;
			}
			
			DepartmentController.saveDepartmentByWebService(
				new JSONModel(this.getView().getModel().getProperty("/selectedDepartment")), this.saveDepartmentCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("startPageRoute");	
			this.getView().byId("departmentComboBox").setSelectedItem(null);
		},
		
		
		/**
		 * Callback function of the queryDepartments RESTful WebService call in the DepartmentController.
		 */
		queryDepartmentsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oModel = oCallingController.getView().getModel();
			
			oModel.setData({departments : oReturnData}, true);
			
			if(oReturnData.data != null) {
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("departmentEdit.dataLoaded"));
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(oReturnData.message[0].text);
			}                                                 
			
			oCallingController.getView().setModel(oModel);
		},
		
		
		/**
		 * Callback function of the queryEmployees RESTful WebService call in the DepartmentController.
		 */
		queryEmployeesCallback : function(oReturnData, oCallingController) {
			var oModel = oCallingController.getView().getModel();

			oModel.setData({employees : oReturnData}, true);

			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel);	                                                                 
		},
		
		
		/**
		 * Callback function of the saveDepartment RESTful WebService call in the DepartmentController.
		 */
		saveDepartmentCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					//Update the data source of the ComboBox with the new department data.
					DepartmentController.queryDepartmentsByWebService(oCallingController.queryDepartmentsCallback, oCallingController, false);
					//Clear ComboBox preventing display of wrong data (Code - Name).
					oCallingController.getView().byId("departmentComboBox").setSelectedKey(null);
					//Clear selectedDepartment because no ComboBox item is selected.
					oCallingController.getView().getModel().setProperty("/selectedDepartment", null);	
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
		}
	});
});