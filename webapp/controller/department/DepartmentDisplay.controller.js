sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"./DepartmentController"
], function (Controller, MessageToast, JSONModel, DepartmentController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.department.DepartmentDisplay", {
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {			
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("departmentDisplayRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function (oEvent) {
			//Query department data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			DepartmentController.queryDepartmentsByWebService(this.queryDepartmentsCallback, this);
			this.getView().byId("departmentComboBox").setSelectedItem(null);
    	},


		/**
		 * Handles the selection of an item in the employee ComboBox.
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
			oModel.setData({departments:oDepartments, selectedDepartment : oDepartment});
		},


		/**
		 * Callback function of the queryDepartments RESTful WebService call in the DepartmentController.
		 */
		queryDepartmentsCallback : function(oReturnData, oCallingController) {
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oModel = new JSONModel();
			
			oModel.setData({departments : oReturnData});
			
			if(oReturnData.data != null) {
				MessageToast.show(oResourceBundle.getText("departmentDisplay.dataLoaded"));
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(oReturnData.message[0].text);
			}
                                                              
			oCallingController.getView().setModel(oModel);
		}
	});
});