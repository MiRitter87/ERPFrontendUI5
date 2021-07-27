sap.ui.define([
], function () {
	"use strict";
	return {
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
		queryBusinessPartnersByWebService : function(callbackFunction, oCallingController, bShowSuccessMessage) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/businessPartner");
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