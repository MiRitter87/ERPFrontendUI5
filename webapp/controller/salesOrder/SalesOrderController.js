sap.ui.define([
], function () {
	"use strict";
	return {
		/**
		 * Calls a WebService operation to create a sales order.
		 */
		createSalesOrderByWebService : function(oSalesOrderModel, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/salesOrder");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var sJSONData = oSalesOrderModel.getJSON();
			
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