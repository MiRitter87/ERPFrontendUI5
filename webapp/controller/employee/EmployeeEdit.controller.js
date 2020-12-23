sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Item",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, Item, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.employee.EmployeeEdit", {
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {
			this.queryEmployeeWebService();
			this.initializeGenderComboBox();
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			if(this.getView().byId("genderComboBox").getSelectedKey() == "") {
				this.showMessageOnUndefinedGender();
				return;
			}
			
			this.saveEmployeeByWebService();
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("startPageRoute");	
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
		 * Handles the selection of an item in the employee ComboBox.
		 */
		onEmployeeSelectionChange : function (oControlEvent) {
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
			var webServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var queryUrl = webServiceBaseUrl + "/";
			var oModel = new JSONModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : queryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					oModel.setData({employees : data}); // not aData
					
					if(data.data != null) {
						MessageToast.show(oResourceBundle.getText("employeeEdit.dataLoaded"));
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
		
		
		saveEmployeeByWebService : function() {
			var webServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var queryUrl = webServiceBaseUrl + "/";
			var employeeModel = new JSONModel(this.getView().getModel().getProperty("/selectedEmployee"));
			var jsonData = employeeModel.getJSON();
			
			//Use "PUT" to update an existing resource.
			var aData = jQuery.ajax({
				type : "PUT", 
				contentType : "application/json", 
				url : queryUrl,
				data : jsonData, 
				success : function(data,textStatus, jqXHR) {
					if(data.message != null) {
						if(data.message[0].type == 'S') {
							MessageToast.show(data.message[0].text);
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
		},
		
		
		/**
		 * Displays a message in case the gender has not been selected.
		 */
		showMessageOnUndefinedGender : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			MessageBox.error(oResourceBundle.getText("employeeEdit.noGenderSelected"));
		}
	});

});