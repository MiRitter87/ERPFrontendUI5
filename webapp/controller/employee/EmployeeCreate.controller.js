sap.ui.define([
	"sap/ui/core/mvc/Controller", 
	"sap/ui/core/Item",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function (Controller, Item, MessageToast, MessageBox, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.employee.EmployeeCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			this.initializeGenderComboBox();
			this.initializeEmployeeModel();
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			this.saveEmployeeByWebService();
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			
		},
		
		
		/**
		 * Initializes the ComboBox for gender selection with the description texts in the correct language.
		 */
		initializeGenderComboBox : function () {
			var comboBoxItem = new Item();
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			comboBoxItem.setKey("MALE");
			comboBoxItem.setText(oResourceBundle.getText("gender.male"));
			this.getView().byId("genderComboBox").addItem(comboBoxItem);
			
			comboBoxItem = new Item();
			comboBoxItem.setKey("FEMALE");
			comboBoxItem.setText(oResourceBundle.getText("gender.female"));
			this.getView().byId("genderComboBox").addItem(comboBoxItem);
		},
		
		
		/**
		 * Initializes the model to which the UI controls are bound.
		 */
		initializeEmployeeModel : function () {
			var employeeModel = new JSONModel();
			
			employeeModel.loadData("model/employee/employeeCreate.json");
			this.getView().setModel(employeeModel);
		},
		
		
		/**
		 * Saves the employee defined in the input form by using the RESTful WebService.
		 */
		saveEmployeeByWebService : function () {
			var webServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var queryUrl = webServiceBaseUrl + "/";
			var employeeModel = this.getView().getModel();
			var jsonData = employeeModel.getJSON();
			
			//Use "POST" to create a resource.
			var aData = jQuery.ajax({
				type : "POST", 
				contentType : "application/json", 
				url : queryUrl,
				data : jsonData, 
				success : function(data,textStatus, jqXHR) {
					if(data.message != null) {
						if(data.message[0].type == 'S') {
							MessageToast.show(data.message[0].text);
							this.initializeEmployeeModel();	//Resets the input fields to the initial state.
						}
						
						if(data.message[0].type == 'E') {
							MessageBox.error(data.message[0].text);
						}
						
						if(data.message[0].type == 'W') {
							MessageBox.warning(data.message[0].text);
						}
					}
				},
				context : this
			});   
		}
	});

});