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
		_onRouteMatched: function () {
			//Query department data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			DepartmentController.queryDepartmentsByWebService(this.queryDepartmentsCallback, this);
			this.resetUIElements();
    	},


		/**
		 * Handles the selection of an item in the employee ComboBox.
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
			
			//Set the model of the view according to the selected department to allow binding of the UI elements.
			this.getView().setModel(oDepartmentModel, "selectedDepartment");
		},


		/**
		 * Callback function of the queryDepartments RESTful WebService call in the DepartmentController.
		 */
		queryDepartmentsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				MessageToast.show(oResourceBundle.getText("departmentDisplay.dataLoaded"));
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(oReturnData.message[0].text);
			}
                                                              
			oCallingController.getView().setModel(oModel, "departments");
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("departmentComboBox").setSelectedItem(null);

			this.getView().byId("codeText").setText("");
			this.getView().byId("nameText").setText("");
			this.getView().byId("descriptionText").setText("");
			this.getView().byId("headText").setText("");
		}
	});
});