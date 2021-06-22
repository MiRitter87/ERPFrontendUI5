sap.ui.define([
], function () {
	"use strict";
	return {
		/**
		 * Queries the image WebService for the image with the given ID.
		 */
		queryImageByWebService : function(iImageId, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/image");
			var sQueryUrl = sWebServiceBaseUrl + "/" + iImageId;
			jQuery.ajax({
				type : "GET", 
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