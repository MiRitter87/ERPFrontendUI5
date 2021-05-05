sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../../model/formatter"
], function (Controller, formatter) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.salesOrder.SalesOrderOverview", {
		formatter: formatter,
		
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {
			
		}
	});
});