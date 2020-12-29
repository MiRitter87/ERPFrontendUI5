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
		 * Handles the press-event of the salaryData button.
		 */
		onSalaryPressed : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var salaryData = this.getEmployeeSalaryData();
			
			//No employee selected
			if(this.getView().byId("employeeComboBox").getSelectedKey() == "") {
				MessageToast.show(oResourceBundle.getText("employeeDisplay.noEmployeeSelected"));
				return;
			}
			
			//Employee has no salary defined
			if(salaryData == null) {
				MessageToast.show(oResourceBundle.getText("employeeDisplay.noSalaryDataExist"));
				return;
			}
			
			oRouter.navTo("employeeSalaryDisplayRoute");	
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
			
			//Determine and set the localized gender name.
			this.setLocalizedGender();
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
						MessageToast.show(oResourceBundle.getText("employeeDisplay.dataLoaded"));
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
		 * Determines and sets the localized text of the selected employees gender.
		 */
		setLocalizedGender : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			//1. Get the gender of the selected employee.
			var gender = this.getView().getModel().getProperty("/selectedEmployee/gender");
			var genderText;
			
			//2. Determine the localized text of the gender.
			if(gender == "MALE")
				genderText = oResourceBundle.getText("gender.male");
			else if(gender == "FEMALE")
				genderText = oResourceBundle.getText("gender.female");
			
			//3. Apply the text to the gender label.
			this.getView().byId("gender").setText(genderText);
		},
		
		
		/**
		 * Gets the salary data of the selected employee.
		 */
		getEmployeeSalaryData : function () {
			var salaryData = this.getView().getModel().getProperty("/selectedEmployee/salaryData");
			return salaryData;
		}
	});

});