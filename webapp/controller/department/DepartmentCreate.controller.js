sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"./DepartmentController"
], function (Controller, MessageToast, MessageBox, JSONModel, DepartmentController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.department.DepartmentCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("departmentCreateRoute").attachMatched(this._onRouteMatched, this);
			
			this.initializeDepartmentModel();
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Load all employees. Those are the candidates that can be selected in the head selection ComboBox.
			//Query employee data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			DepartmentController.queryEmployeesByWebService(this.queryEmployeesCallback, this, "NO_HEAD_ONLY");
			this.deselectHeadSelection();
    	},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			if(this.getView().byId("headComboBox").getSelectedKey() == "") {
				this.showMessageOnUndefinedHead();
				return;
			}
			
			DepartmentController.createDepartmentByWebService(this.getView().getModel("newDepartment"), this.createDepartmentCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			this.initializeDepartmentModel();
			oRouter.navTo("startPageRoute");	
		},
		
		
		/**
		 * Handles the selection of an item in the head of department ComboBox.
		 */
		onHeadSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oEmployeesModel = this.getView().getModel("employees");
			var oDepartmentModel = this.getView().getModel("newDepartment");
			var oSelectedEmployee;
			
			if(oSelectedItem == null)
				return;
			
			oSelectedEmployee = DepartmentController.getEmployeeById(oSelectedItem.getKey(), oEmployeesModel.oData.employee);			
			oDepartmentModel.setData({head: oSelectedEmployee}, true);
		},
		
		
		/**
		 * Displays a message in case the head of department has not been selected.
		 */
		showMessageOnUndefinedHead : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			MessageBox.error(oResourceBundle.getText("departmentCreate.noHeadSelected"));
		},
		
		
		/**
		 * Initializes the model to which the UI controls are bound.
		 */
		initializeDepartmentModel : function () {
			var oDepartmentModel = new JSONModel();
			
			oDepartmentModel.loadData("model/department/departmentCreate.json");
			this.getView().setModel(oDepartmentModel, "newDepartment");
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
					MessageToast.show(data.message[0].text);
			}                                                            
			
			oCallingController.getView().setModel(oModel, "employees");
		},
		
		
		/**
		 * Callback function of the createDepartment RESTful WebService call in the DepartmentController.
		 */
		createDepartmentCallback : function (oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					oCallingController.initializeDepartmentModel();	//Resets the input fields to the initial state.
					oCallingController.deselectHeadSelection();
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
		 * Resets the selection of the head of department. No item in the ComboBox is selected afterwards.
		 */
		deselectHeadSelection : function () {
			this.getView().byId("headComboBox").setSelectedItem(null);
		}
	});
});