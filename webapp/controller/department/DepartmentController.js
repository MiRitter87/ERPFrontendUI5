sap.ui.define([
], function () {
	"use strict";
	return {
		/**
		 * Gets the data of the employee with the given ID.
		 */
		getEmployeeById : function(iEmployeeId, oEmployees) {
			for(var i = 0; i < oEmployees.length; i++) {
    			var oTempEmployee = oEmployees[i];
    			
				if(oTempEmployee.id == iEmployeeId) {
					return oTempEmployee;
				}
			}
			
			return null;
		},
		
		
		/**
		 * Gets the data of the department with the given ID.
		 */
		getDepartmentById : function(sDepartmentCode, oDepartments) {
			for(var i = 0; i < oDepartments.length; i++) {
    			var oTempDepartment = oDepartments[i];
    			
				if(oTempDepartment.code == sDepartmentCode) {
					return oTempDepartment;
				}
			}
			
			return null;
		},
		
		
		/**
		 * Queries the employee WebService for all employees.
		 */
		queryEmployeesByWebService : function(callbackFunction, oCallingController, sHeadQueryParameter) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var sQueryUrl = sWebServiceBaseUrl + "?employeeHeadQuery=" + sHeadQueryParameter;
			jQuery.ajax({
				type : "GET", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success : function(data) {
					callbackFunction(data, oCallingController);
				}
			});
		},
		
		
		/**
		 * Calls a WebService operation to create a new department.
		 */
		createDepartmentByWebService : function(oDepartmentModel, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/department");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var sJSONData = oDepartmentModel.getJSON();
			
			//Use "POST" to create a resource.
			jQuery.ajax({
				type : "POST", 
				contentType : "application/json", 
				url : sQueryUrl,
				data : sJSONData, 
				success : function(data) {
					callbackFunction(data, oCallingController);
				}
			});
		},
		
		
		/**
		 * Queries the department WebService for all departments.
		 */
		queryDepartmentsByWebService : function(callbackFunction, oCallingController, bShowSuccessMessage) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/department");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			
			jQuery.ajax({
				type : "GET", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success : function(data) {
					callbackFunction(data, oCallingController, bShowSuccessMessage);
				}
			});                                                                 
		},
		
		
		/**
		 * Calls a WebService operation to save an existing department.
		 */
		saveDepartmentByWebService : function(oDepartmentModel, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/department");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var sJSONData = oDepartmentModel.getJSON();
			
			//Use "PUT" to update an existing resource.
			jQuery.ajax({
				type : "PUT", 
				contentType : "application/json", 
				url : sQueryUrl,
				data : sJSONData, 
				success : function(data) {
					callbackFunction(data, oCallingController);
				}
			});  
		},
		
		
		/**
		 * Calls a WebService operation to delete an existing department.
		 */
		deleteDepartmentByWebService : function(oDepartment, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/department");
			var sQueryUrl = sWebServiceBaseUrl + "/" + oDepartment.code;
			
			//Use "DELETE" to delete an existing resource.
			jQuery.ajax({
				type : "DELETE", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success : function(data) {
					callbackFunction(data, oCallingController);
				}
			});
		}
	};
});