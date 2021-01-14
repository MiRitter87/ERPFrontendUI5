sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.employee.EmployeeOverview", {
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("employeeOverviewRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the press-event of the salary button.
		 */
		onSalaryPressed : function () {
			var oSalaryData, oResourceBundle, oRouter;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(this.isEmployeeSelected() == false) {
				MessageToast.show(oResourceBundle.getText("employeeOverview.noEmployeeSelected"));
				return;
			}
			
			oSalaryData = this.getEmployeeSalaryData();
			
			if(oSalaryData == null) {
				MessageToast.show(oResourceBundle.getText("employeeOverview.noSalaryDataExist"));
				return;
			}
			
			oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("employeeSalaryDisplayRoute", {"employeeId" : oSalaryData.id});
		},
		
		
		/**
		 * Handles the press-event of the delete button.
		 */
		onDeletePressed : function () {
			
		},
		
		
		/**
		 * Queries the employee WebService. If the call is successful, the model is updated with the employee data.
		 */
		queryEmployeeWebService : function() {
			var webServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var queryUrl = webServiceBaseUrl + "/";
			var oModel = new JSONModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : queryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					oModel.setData({employees : data}); // not aData
					
					if(data.data != null) {
						MessageToast.show(oResourceBundle.getText("employeeOverview.dataLoaded"));
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
		 * Formatter of the gender text in the table. Provides the localized text of a gender.
		 */
		genderTextFormatter : function (gender) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			switch(gender) {
				case "MALE":
					return oResourceBundle.getText("gender.male");
				case "FEMALE":
					return oResourceBundle.getText("gender.female");
			}
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function (oEvent) {
			//Query employee data every time a user navigates to this view. This assures that changes are being displayed in the table.
			this.queryEmployeeWebService();
    	},


		/**
		 * Checks if an employee has been selected.
		 */
		isEmployeeSelected : function () {
			if(this.getView().byId("employeeTable").getSelectedItem() == null)
				return false;
			else
				return true;
		},
		
		
		/**
		 * Gets the salary data of the selected employee.
		 */
		getEmployeeSalaryData : function () {
			var oListItem = this.getView().byId("employeeTable").getSelectedItem();
			var oContext = oListItem.getBindingContext();
			var oSelectedEmployee = oContext.getProperty(null, oContext);
			
			return oSelectedEmployee.salaryData;
		}
	});

});