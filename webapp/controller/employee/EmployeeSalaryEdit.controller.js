sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/Title"
], function (Controller, MessageToast, JSONModel, Title) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.employee.EmployeeSalaryEdit", {
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("employeeSalaryEditRoute").attachMatched(this.onRouteMatched, this);
		},
		
		/**
		 * Handles additional tasks to be performed when the user navigates to this view.
		 */
		onRouteMatched : function (oEvent) {
			var oArguments = oEvent.getParameter("arguments");
    		var sEmployeeId = oArguments.employeeId;
			
			this.queryEmployeeWebService(sEmployeeId, "employeeSalaryEdit.dataLoaded");
		},
		
		
		/**
		 * Handles a press of the back-button in the header.
		 */
		onBackPress : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("employeeEditRoute");	
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			//TODO: Call WebService to Persist salary changes.
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			//Query WebService and overwrite the users changes with the current backend state
			var sEmployeeId = this.getView().getModel().getProperty("/employee/data/id");
			this.queryEmployeeWebService(sEmployeeId, "employeeSalaryEdit.originalStateRestored");
		},
		
		
		/**
		 * Queries the employee WebService. If the call is successful, the model is updated with the employee data.
		 */
		queryEmployeeWebService : function(employeeId, successMessageKey) {
			var webServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var queryUrl = webServiceBaseUrl + "/" + employeeId;
			var oModel = new JSONModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : queryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					oModel.setData({employee : data}); // not aData
					
					if(data.data != null) {
						MessageToast.show(oResourceBundle.getText(successMessageKey));
						this.initializeTitleWithName();
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
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oTitleControl = this.getView().byId("toolbarTitle");
			var sFirstName = this.getView().getModel().getProperty("/employee/data/firstName");
			var sLastName = this.getView().getModel().getProperty("/employee/data/lastName");
			var sTitleText = oResourceBundle.getText("employeeSalaryEdit.headerWithName", [sFirstName, sLastName]);
			
			oTitleControl.setText(sTitleText);
		},
		
		
		/**
		 * Formats the date provided by the backend as milliseconds since 01/01/1970 to a human readable form.
		 */
		dateFormatter : function (timestamp) {
			return new Date(parseInt(timestamp));
		}
	});
});