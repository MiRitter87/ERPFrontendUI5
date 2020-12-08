sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.employee.EmployeeDisplay", {
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {
			this.queryEmployeeWebService();
		},
		
		
		/**
		 * Handles the selection of an item in the employee ComboBox.
		 */
		employeeSelectionChange : function (oControlEvent) {
			var selectedItem = oControlEvent.getParameters().selectedItem;
			var oModel = this.getView().getModel();
			var employees = oModel.oData.employees;
			var employee;
			
			//Get the selected employee from the array of all employees according to the id.
			for(var i = 0; i < employees.data.employee.length; i++) {
    			var tempEmployee = employees.data.employee[i];
    			
				if(tempEmployee.id == selectedItem.getKey()) {
					employee = tempEmployee;
				}
			}
			
			//Set the model of the view according to the selected employee to allow binding of the UI elements.
			oModel.setData({employees:employees, selectedEmployee : employee});
		},

		
		/**
		 * Queries the employee WebService. If the call is successful, the model is updated with the employee data.
		 */
		queryEmployeeWebService : function() {
			var queryUrl = this.getEmployeeWebServiceBaseUrl() + "/";
			var oModel = new JSONModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : queryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					oModel.setData({employees : data}); // not aData
					
					if(data.data != null) {
						MessageToast.show("Mitarbeiterdaten wurden geladen.");						
					}
					else {
						if(data.message != null)
							MessageToast.show(data.message[0].text);
					}
				}                                                                                                              
			});                                                                 
			
			this.getView().setModel(oModel);
		},
		
		
		/**
		 * Determines the base-URL of the employee WebService from the model.
		 */
		getEmployeeWebServiceBaseUrl : function() {
			var webServiceBaseUrlModel = this.getOwnerComponent().getModel("webServiceBaseUrls");
			return webServiceBaseUrlModel.getProperty("/employee");
		}
	});

});