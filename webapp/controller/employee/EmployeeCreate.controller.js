sap.ui.define([
	"sap/ui/core/mvc/Controller", 
	"sap/ui/core/Item"
], function (Controller, Item) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.employee.EmployeeCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			this.initializeGenderComboBox();
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
		}
	});

});