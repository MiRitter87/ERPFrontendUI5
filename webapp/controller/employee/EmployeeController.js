sap.ui.define([
	"sap/ui/core/Item"
], function (Item) {
	"use strict";
	return {
		/**
		 * Initializes the given ComboBox with items for gender selection.
		 */
		initializeGenderComboBox : function(oComboBox, oResourceBundle) {
			this.addItemToComboBox(oComboBox, oResourceBundle, "MALE", "gender.male");
			this.addItemToComboBox(oComboBox, oResourceBundle, "FEMALE", "gender.female");
		},
		
		
		/**
		 * Adds an item to the given ComboBox.
		 */
		addItemToComboBox : function(oComboBox, oResourceBundle, sItemKey, sTextKey) {
			var oComboBoxItem = new Item();
			
			oComboBoxItem.setKey(sItemKey);
			oComboBoxItem.setText(oResourceBundle.getText(sTextKey));
			oComboBox.addItem(oComboBoxItem);
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