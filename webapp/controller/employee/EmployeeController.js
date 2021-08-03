sap.ui.define([
	"sap/ui/core/Item"
], function (Item) {
	"use strict";
	return {
		/**
		 * Gets the data of the employee with the given ID.
		 */
		getEmployeeById : function(iEmployeeId, oEmployees) {
			//Get the selected employee from the array of all employees according to the id.
			for(var i = 0; i < oEmployees.length; i++) {
    			var oTempEmployee = oEmployees[i];
    			
				if(oTempEmployee.id == iEmployeeId) {
					return oTempEmployee;
				}
			}
			
			return null;
		},
		
		
		/**
		 * Initializes the given ComboBox with items for gender selection.
		 */
		initializeGenderComboBox : function(oComboBox, oResourceBundle) {
			this.addItemToComboBox(oComboBox, oResourceBundle, "MALE");
			this.addItemToComboBox(oComboBox, oResourceBundle, "FEMALE");
		},
		
		
		/**
		 * Returns the localized text of the given gender.
		 */
		getLocalizedGenderText : function(sGender, oResourceBundle) {
			if(sGender == "MALE")
				return oResourceBundle.getText("employee.gender.male");
			else if(sGender == "FEMALE")
				return oResourceBundle.getText("employee.gender.female");
			else
				return "";
		},
		
		
		/**
		 * Adds an item to the given ComboBox.
		 */
		addItemToComboBox : function(oComboBox, oResourceBundle, sItemKey) {
			var oComboBoxItem = new Item();
			
			oComboBoxItem.setKey(sItemKey);
			oComboBoxItem.setText(this.getLocalizedGenderText(sItemKey, oResourceBundle));
			oComboBox.addItem(oComboBoxItem);
		},
		
		
		/**
		 * Initializes the title of a salary view with the name of the employee.
		 */
		initializeSalaryTitleWithName : function(oEmployee, oCallingController, oTitleControl) {
			var oResourceBundle, sFirstName, sLastName, sTitleText;
			
			if(oEmployee != null) {
				sFirstName = oEmployee.firstName;
				sLastName = oEmployee.lastName;
			}
			else {
				sFirstName = "";
				sLastName = "";
			}
			
			oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			sTitleText = oResourceBundle.getText("employeeSalaryDisplay.headerWithName", [sFirstName, sLastName]);
			oTitleControl.setText(sTitleText);
		},
		
		
		/**
		 * Calls a WebService operation to create a new employee.
		 */
		createEmployeebyWebService : function(oEmployeeModel, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var sJSONData = oEmployeeModel.getJSON();
			
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
		 * Queries the employee WebService for all employees.
		 */
		queryEmployeesByWebService : function(callbackFunction, oCallingController, bShowSuccessMessage) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
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
		 * Queries the employee WebService for the employee with the given ID.
		 */
		queryEmployeeById : function(callbackFunction, oCallingController, sEmployeeId) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var sQueryUrl = sWebServiceBaseUrl + "/" + sEmployeeId;
			
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
		 * Updates changes of the employee data using the WebService.
		 */
		saveEmployeeByWebService : function(oEmployeeModel, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var sJSONData = oEmployeeModel.getJSON();
			
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
		 * Deletes the given employee using the WebService.
		 */
		deleteEmployeeByWebService : function(oEmployee, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var sQueryUrl = sWebServiceBaseUrl + "/" + oEmployee.id;
			
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