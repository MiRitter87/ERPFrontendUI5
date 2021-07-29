sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../../model/formatter",
	"./EmployeeController"
], function (Controller, MessageToast, JSONModel, History, formatter, EmployeeController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.employee.EmployeeSalaryDisplay", {
		formatter: formatter,
		
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("employeeSalaryDisplayRoute").attachMatched(this.onRouteMatched, this);
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
			var oRouter;
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("startPageRoute");	
			}
		},
		
		
		/**
		 * Callback function of the queryEmployeeById RESTful WebService call in the EmployeeController.
		 */
		queryEmployeeByIdCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();

			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				EmployeeController.initializeSalaryTitleWithName(oReturnData.data, oCallingController, 
					oCallingController.getView().byId("toolbarTitle"));
				MessageToast.show(oResourceBundle.getText("employeeSalaryDisplay.dataLoaded"));
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(oReturnData.message[0].text);
			}
                                                              			
			oCallingController.getView().setModel(oModel, "employee");
		}
	});
});