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
			//Query department and employee data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			DepartmentController.queryDepartmentsByWebService(this.queryDepartmentsCallback, this, true);
			DepartmentController.queryEmployeesByWebService(this.queryEmployeesCallback, this, "ALL");
			
			this.resetUIElements();
    	},
		
		
		/**
		 * Handles the selection of an item in the department ComboBox.
		 */
		onDepartmentSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oDepartments = this.getView().getModel("departments");
			var oDepartment;
			var oDepartmentModel = new JSONModel();
			
			if(oSelectedItem == null) {
				this.getView().setModel(oDepartmentModel, "selectedDepartment");
				this.resetUIElements();
				return;
			}
				
			oDepartment = DepartmentController.getDepartmentById(oSelectedItem.getKey(), oDepartments.oData.department);
			oDepartmentModel.setData(oDepartment);
			
			//Set the model of the view according to the selected business partner to allow binding of the UI elements.
			this.getView().setModel(oDepartmentModel, "selectedDepartment");
		},
		
		
		/**
		 * Handles the selection of an item in the head of department ComboBox.
		 */
		onHeadSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oEmployeesModel = this.getView().getModel("employees");
			var oDepartmentModel = this.getView().getModel("selectedDepartment");
			var oSelectedEmployee;
			
			if(oSelectedItem == null)
				return;
			
			oSelectedEmployee = DepartmentController.getEmployeeById(oSelectedItem.getKey(), oEmployeesModel.oData.employee);			
			oDepartmentModel.setData({head: oSelectedEmployee}, true);
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
			
			DepartmentController.saveDepartmentByWebService(this.getView().getModel("selectedDepartment"), this.saveDepartmentCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("startPageRoute");	
		},
		
		
		/**
		 * Callback function of the queryDepartments RESTful WebService call in the DepartmentController.
		 */
		queryDepartmentsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("departmentEdit.dataLoaded"));
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(oReturnData.message[0].text);
			}                                                 
			
			oCallingController.getView().setModel(oModel, "departments");
		},
		
		
		/**
		 * Callback function of the queryEmployees RESTful WebService call in the DepartmentController.
		 */
		queryEmployeesCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "employees");	                                                                 
		},
		
		
		/**
		 * Callback function of the saveDepartment RESTful WebService call in the DepartmentController.
		 */
		saveDepartmentCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					//Update the data source of the ComboBox with the new department data.
					DepartmentController.queryDepartmentsByWebService(oCallingController.queryDepartmentsCallback, oCallingController, false);
					oCallingController.resetUIElements();
					//Clear selectedDepartment because no ComboBox item is selected.
					oCallingController.getView().setModel(null, "selectedDepartment");	
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
			this.getView().byId("departmentComboBox").setSelectedItem(null);
			
			this.getView().byId("codeInput").setValue("");
			this.getView().byId("nameInput").setValue("");
			this.getView().byId("descriptionTextArea").setValue("");
			
			this.getView().byId("headComboBox").setSelectedItem(null);

		}
	});
});