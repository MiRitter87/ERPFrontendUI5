sap.ui.define([
	"sap/ui/core/Item"
], function (Item) {
	"use strict";
	return {
		/**
		 * Checks if a valid price is filled in.
		 */
		isPriceValid : function (sPriceInputString) {
			var fPricePerUnit = parseFloat(sPriceInputString);
			
			if(isNaN(fPricePerUnit)) {
				return false;
			}
			else {
				return true;
			}
		},
		
		
		/**
		 * Validates the given price input field.
		 *
		 * There is a bug in german locale when defining an Input as Number of type float.
		 * This is because the framework has a problem with the german delimiter ',' for fractional digits.
		 * See ticket here: https://github.com/SAP/openui5/issues/2558.
		 *
         * Therefore the Input is set as type String and the price is parsed manually in this function.
		 */
		validatePriceInput : function (oPriceInput, oResourceBundle, oModel, sPricePropertyPath) {
			var sPriceInputString = oPriceInput.getValue();
			var fPricePerUnit = parseFloat(sPriceInputString);
			
			if(isNaN(fPricePerUnit)) {
				oPriceInput.setValueState(sap.ui.core.ValueState.Error);
				oPriceInput.setValueStateText(oResourceBundle.getText("material.useDecimalPlacesError"));
				oModel.setProperty(sPricePropertyPath, 0);
			}
			else {
				oPriceInput.setValueState(sap.ui.core.ValueState.None);
				oModel.setProperty(sPricePropertyPath, fPricePerUnit);			
			}
		},
		
		
		/**
		 * Initializes the given ComboBox with items for unit selection.
		 */
		initializeUnitComboBox : function(oComboBox, oResourceBundle) {
			this.addItemToComboBox(oComboBox, oResourceBundle, "ST", "unit.st");
			this.addItemToComboBox(oComboBox, oResourceBundle, "L", "unit.l");
			this.addItemToComboBox(oComboBox, oResourceBundle, "KG", "unit.kg");
			this.addItemToComboBox(oComboBox, oResourceBundle, "T", "unit.t");
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
		 * Calls a WebService operation to create a material.
		 */
		createMaterialbyWebService : function(oMaterialModel, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/material");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var sJSONData = oMaterialModel.getJSON();
			
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
		 * Queries the material WebService for all materials.
		 */
		queryMaterialsByWebService : function(callbackFunction, oCallingController, bShowSuccessMessage) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/material");
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
		 * Updates changes of the material data using the WebService.
		 */
		saveMaterialByWebService : function(oMaterialModel, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/material");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var sJSONData = oMaterialModel.getJSON();
			
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
		 * Deletes the given material using the WebService.
		 */
		deleteMaterialByWebService : function(oMaterial, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/material");
			var sQueryUrl = sWebServiceBaseUrl + "/" + oMaterial.id;
			
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