sap.ui.define([
	"sap/ui/core/Item"
], function (Item) {
	"use strict";
	return {
		/**
		 * Initializes the given ComboBox with items for cuurency selection.
		 */
		initializeCurrencyComboBox : function(oComboBox, oResourceBundle) {
			this.addItemToComboBox(oComboBox, oResourceBundle, "EUR", "currency.eur");
		},
		
		
		/**
		 * Adds an item to the ComboBox.
		 */
		addItemToComboBox : function(oComboBox, oResourceBundle, sItemKey, sTextKey) {
			var oComboBoxItem = new Item();
			
			oComboBoxItem.setKey(sItemKey);
			oComboBoxItem.setText(oResourceBundle.getText(sTextKey));
			oComboBox.addItem(oComboBoxItem);
		},
		
		
		/**
		 * Validates the given balance input field.
		 *
		 * There is a bug in german locale when defining an Input as Number of type float.
		 * This is because the framework has a problem with the german delimiter ',' for fractional digits.
		 * See ticket here: https://github.com/SAP/openui5/issues/2558.
		 *
         * Therefore the Input is set as type String and the balance is parsed manually in this function.
		 */
		validateBalanceInput : function (oBalanceInput, oResourceBundle, oModel, sBalancePropertyPath) {
			var sBalanceInputString = oBalanceInput.getValue();
			var fBalance = parseFloat(sBalanceInputString);
			
			if(isNaN(fBalance)) {
				oBalanceInput.setValueState(sap.ui.core.ValueState.Error);
				oBalanceInput.setValueStateText(oResourceBundle.getText("account.useDecimalPlacesError"));
				oModel.setProperty(sBalancePropertyPath, 0);
			}
			else {
				oBalanceInput.setValueState(sap.ui.core.ValueState.None);
				oModel.setProperty(sBalancePropertyPath, fBalance);			
			}
		},
		
		
		/**
		 * Checks if a valid balance is filled in.
		 */
		isBalanceValid : function (sBalanceInputString) {
			var fBalance = parseFloat(sBalanceInputString);
			
			if(isNaN(fBalance)) {
				return false;
			}
			else {
				return true;
			}
		},
		
		
		/**
		 * Calls a WebService operation to create an account.
		 */
		createAccountByWebService : function(oAccountModel, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/account");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var sJSONData = oAccountModel.getJSON();
			
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
		}
	};
});