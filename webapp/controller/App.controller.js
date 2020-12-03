sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.App", {
		
		/**
		 * Handles the selection of an item in the navigation menu.
		 */
		onItemSelect : function(oEvent) {
			var item = oEvent.getParameter('item');
			this.byId("pageContainer").to(this.getView().createId(item.getKey()));
		},
	});

});