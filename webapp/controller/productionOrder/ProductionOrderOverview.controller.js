sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./ProductionOrderController",
	"../../model/formatter"
], function (Controller, ProductionOrderController, formatter) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.productionOrder.ProductionOrderOverview", {
		formatter: formatter,
		
		
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {
			
		},
		
		
		/**
		 * Formatter of the production order status text.
		 */
		orderStatusTextFormatter: function(sStatus) {
			return ProductionOrderController.orderStatusTextFormatter(sStatus, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Formatter of the production order status state.
		 */
		orderStatusStateFormatter: function(sStatus) {
			return ProductionOrderController.orderStatusStateFormatter(sStatus);
		},
	});
});