sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"./DepartmentController"
], function (Controller, MessageToast, MessageBox, JSONModel, DepartmentController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.department.DepartmentOverview", {
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("departmentOverviewRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query department data every time a user navigates to this view. This assures that changes are being displayed in the table.
			DepartmentController.queryDepartmentsByWebService(this.queryDepartmentsCallback, this, true);
    	},
		
		
		/**
		 * Handles the press-event of the delete button.
		 */
		onDeletePressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(this.isDepartmentSelected() == false) {
				MessageBox.error(oResourceBundle.getText("departmentOverview.noDepartmentSelected"));
				return;
			}
			
			DepartmentController.deleteDepartmentByWebService(this.getSelectedDepartment(), this.deleteDepartmentCallback, this);
		},
		
		
		/**
		 * Checks if a department has been selected.
		 */
		isDepartmentSelected : function () {
			if(this.getView().byId("departmentTable").getSelectedItem() == null)
				return false;
			else
				return true;
		},
		
		
		/**
		 * Gets the the selected department.
		 */
		getSelectedDepartment : function () {
			var oListItem = this.getView().byId("departmentTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("departments");
			var oSelectedDepartment = oContext.getProperty(null, oContext);
			
			return oSelectedDepartment;
		},
		
		
		/**
		 * Callback function of the queryDepartments RESTful WebService call in the DepartmentController.
		 */
		queryDepartmentsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();

			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true) {
					MessageToast.show(oResourceBundle.getText("departmentOverview.dataLoaded"));
				}					
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(oReturnData.message[0].text);
			}                                                              
			
			oCallingController.getView().setModel(oModel, "departments");
		},
		
		
		/**
		 * Callback function of the deleteDepartments RESTful WebService call in the DepartmentController.
		 */
		deleteDepartmentCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					DepartmentController.queryDepartmentsByWebService(oCallingController.queryDepartmentsCallback, oCallingController, false);
				}
				
				if(oReturnData.message[0].type == 'E') {
					MessageBox.error(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'W') {
					MessageBox.warning(oReturnData.message[0].text);
				}
			}
		},
	});

});