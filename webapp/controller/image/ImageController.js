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
		},
		
		
		/**
		 * Updates changes of the image meta data data using the WebService.
		 */
		saveImageMetaDataByWebService : function(oImageMetaDataModel, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/image");
			var sQueryUrl = sWebServiceBaseUrl + "/metaData";
			var sJSONData = oImageMetaDataModel.getJSON();
			
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
		}
	};
});