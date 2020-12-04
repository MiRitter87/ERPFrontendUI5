sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (Controller, MessageToast) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.employee.EmployeeDisplay", {
		onInit : function () {
			alert("Init aufgerufen: EmployeeDisplay.");
		},
		
		/**
		 * Handles a click at the "load data" button.
		 */
		onPress : function () {
			
			var employeeId = this.getView().byId("queryEmployeeId").getValue();
			
			//Check if user input is valid
			if(this.isInputValid(employeeId) == false) {
				MessageToast.show("Bitte geben Sie eine Personalnummer ein.");
				return;
			}
			
			this.queryEmployeeWebService(employeeId);
		},
		
		
		/**
		 * Checks if the given string is a valid employee ID.
		 */
		isInputValid : function(employeeId)  {
			//Is input empty?
			if(employeeId == "")
				return false;
			
			//Is input numeric?
			if(isNaN(employeeId))
				return false;
			else
				return true;
		},
		
		
		/**
		 * Queries the employee WebService. If the call is successful, the model is updated with the employee data.
		 */
		queryEmployeeWebService : function(employeeId) {
			var queryUrl = "http://127.0.0.1:8080/backend/services/rest/employees/" + employeeId;
			var oModel = new sap.ui.model.json.JSONModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : queryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					oModel.setData({modelData : data}); // not aData
					
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
		}
	});

});