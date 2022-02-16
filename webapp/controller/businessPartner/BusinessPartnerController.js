sap.ui.define([
	"../MainController"
], function (MainController) {
	"use strict";
	return {
		/**
		 * Initializes the given ComboBox with items for type selection.
		 */
		initializeTypeComboBox : function(oComboBox, oResourceBundle) {
			MainController.addItemToComboBox(oComboBox, oResourceBundle, "CUSTOMER", "businessPartner.type.customer");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, "VENDOR", "businessPartner.type.vendor");
		},
		
		
		/**
		 * Gets the business partner data of the business partner with the given ID.
		 */
		getBusinessPartnerById : function(iBusinessPartnerId, oBusinessPartners) {
			//Get the selected business partner from the array of all business partners according to the id.
			for(var i = 0; i < oBusinessPartners.length; i++) {
    			var oTempBusinessPartner = oBusinessPartners[i];
    			
				if(oTempBusinessPartner.id == iBusinessPartnerId) {
					return oTempBusinessPartner;
				}
			}
			
			return null;
		},
		
		
		/**
		 * Returns a string of localized types based on the given array of types.
		 */
		getLocalizedTypesString : function(aTypes, oResourceBundle) {
			var sTypeText = "", sType = "", sTypesText = "";

			for(var i = 0; i < aTypes.length; i++) {
    			sType = aTypes[i];

				if(sType == "CUSTOMER")
					sTypeText = oResourceBundle.getText("businessPartner.type.customer");
				else if(sType == "VENDOR")
					sTypeText = oResourceBundle.getText("businessPartner.type.vendor");
    			
				if(i > 0)
					sTypesText += ', ';

				sTypesText += sTypeText;
			}
			
			return sTypesText;
		},
		
		
		/**
		 * Calls a WebService operation to create a business partner.
		 */
		createBusinessPartnerByWebService : function(oBusinessPartnerModel, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/businessPartner");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var sJSONData = oBusinessPartnerModel.getJSON();
			
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
		 * Queries the business partner WebService for all business partners.
		 */
		queryBusinessPartnersByWebService : function(callbackFunction, oCallingController, bShowSuccessMessage, sTypeQueryParameter) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/businessPartner");
			var sQueryUrl = sWebServiceBaseUrl + "?bpTypeQuery=" + sTypeQueryParameter;;
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
		 * Updates changes of the business partner data using the WebService.
		 */
		saveBusinessPartnerByWebService : function(oBusinessPartnerModel, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/businessPartner");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var sJSONData = oBusinessPartnerModel.getJSON();
			
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
		 * Deletes the given business partner using the WebService.
		 */
		deleteBusinessPartnerByWebService : function(oBusinessPartner, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/businessPartner");
			var sQueryUrl = sWebServiceBaseUrl + "/" + oBusinessPartner.id;
			
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