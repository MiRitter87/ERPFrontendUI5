sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.App", {
		/**
		 * Initializes the controller.
		 */
		onInit : function() {
			this.oModel = new JSONModel();
			this.oModel.loadData("model/model.json");
			this.getView().setModel(this.oModel);
		},
		
		/**
		 * Handles the selection of an item in the navigation menu.
		 */
		onItemSelect : function(oEvent) {
			var item = oEvent.getParameter('item');
			this.byId("pageContainer").to(this.getView().createId(item.getKey()));
		},
	});

});