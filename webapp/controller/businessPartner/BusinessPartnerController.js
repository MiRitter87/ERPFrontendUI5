sap.ui.define([
], function () {
	"use strict";
	return {
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
		}
	};
});