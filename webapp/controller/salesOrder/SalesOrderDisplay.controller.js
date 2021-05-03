sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./SalesOrderController",
	"../../model/formatter"
], function (Controller, SalesOrderController, formatter) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.salesOrder.SalesOrderDisplay", {
		formatter: formatter,
		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			
		},
		
		
		/**
		 * Formatter of the material text in the item table. Provides the name of a material based on the given ID.
		 */
		materialNameFormatter : function(iMaterialId) {
			return SalesOrderController.materialNameFormatter(iMaterialId, this.getView().getModel("materials"));
		},
		
		
		/**
		 * Formatter of the material unit in the item table. Provides the unit of a material based on the given ID.
		 */
		materialUnitFormatter: function(iMaterialId) {
			return SalesOrderController.materialUnitFormatter(iMaterialId, this.getView().getModel("materials"));
		},
		
		
		/**
		 * Formatter of the material currency in the item table. Provides the currency of a material based on the given ID.
		 */
		materialCurrencyFormatter: function(iMaterialId) {
			return SalesOrderController.materialCurrencyFormatter(iMaterialId, this.getView().getModel("materials"));
		},
	});
});