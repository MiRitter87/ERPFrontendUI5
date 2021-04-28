sap.ui.define([
], function () {
	"use strict";
	return {
		/**
		 * Formatter of the material text in the item table. Provides the name of a material based on the given ID.
		 */
		materialNameFormatter : function(iMaterialId, oMaterials) {
			var oMaterial = this.getMaterialById(iMaterialId, oMaterials);
			
			if(oMaterial != null)	
				return oMaterial.name;
			else
				return "";
		},
		
		
		/**
		 * Formatter of the material unit in the item table. Provides the unit of a material based on the given ID.
		 */
		materialUnitFormatter: function(iMaterialId, oMaterials) {
			var oMaterial = this.getMaterialById(iMaterialId, oMaterials);
			
			if(oMaterial != null)	
				return oMaterial.unit;
			else
				return "";
		},
		
		
		/**
		 * Formatter of the material currency in the item table. Provides the currency of a material based on the given ID.
		 */
		materialCurrencyFormatter: function(iMaterialId, oMaterials) {
			var oMaterial = this.getMaterialById(iMaterialId, oMaterials);
			
			if(oMaterial != null)	
				return oMaterial.currency;
			else
				return "";
		},
		
		
		/**
		 * Gets the material data of the material with the given ID.
		 */
		getMaterialById : function(iMaterialId, oMaterials) {
			for(var i = 0; i < oMaterials.oData.material.length; i++) {
    			var tempMaterial = oMaterials.oData.material[i];
    			
				if(tempMaterial.id == iMaterialId) {
					return tempMaterial;
				}
			}
			
			return null;
		},
		
		
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
		},
		
		
		/**
		 * Queries the sales order WebService for all sales orders.
		 */
		querySalesOrdersByWebService : function(callbackFunction, oCallingController, bShowSuccessMessage) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/salesOrder");
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
	};
});