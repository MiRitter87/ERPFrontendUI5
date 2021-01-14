sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/Title",
	"sap/ui/core/routing/History",
	"../../model/formatter"
], function (Controller, MessageToast, JSONModel, Title, History, formatter) {
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
			
			this.queryEmployeeWebService(sEmployeeId);
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
		 * Queries the employee WebService. If the call is successful, the model is updated with the employee data.
		 */
		queryEmployeeWebService : function(employeeId) {
			var webServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var queryUrl = webServiceBaseUrl + "/" + employeeId;
			var oModel = new JSONModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : queryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					oModel.setData({employee : data}); // not aData
					this.initializeTitleWithName();
					
					if(data.data != null) {
						MessageToast.show(oResourceBundle.getText("employeeSalaryDisplay.dataLoaded"));
					}
					else {
						if(data.message != null)
							MessageToast.show(data.message[0].text);
					}
				},
				context : this
			});                                                                 
			
			this.getView().setModel(oModel);
		},
		
		
		/**
		 * Initializes the title with the name of the employee whose salary data are being displayed.
		 */
		initializeTitleWithName : function () {
			var oResourceBundle, oTitleControl, sFirstName, sLastName, sTitleText;
			
			if(this.getView().getModel().getProperty("/employee/data") != null) {
				sFirstName = this.getView().getModel().getProperty("/employee/data/firstName");
				sLastName = this.getView().getModel().getProperty("/employee/data/lastName");
			}
			else {
				sFirstName = "";
				sLastName = "";
			}
			
			
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			oTitleControl = this.getView().byId("toolbarTitle");
			sTitleText = oResourceBundle.getText("employeeSalaryDisplay.headerWithName", [sFirstName, sLastName]);
			
			oTitleControl.setText(sTitleText);
		}
	});
});