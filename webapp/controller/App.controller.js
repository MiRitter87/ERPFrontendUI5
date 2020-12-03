sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel"
], function (Controller, JSONModel, ResourceModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.App", {
		/**
		 * Initializes the controller.
		 */
		onInit : function() {
			this.oModel = new JSONModel();
			this.oModel.loadData("model/model.json");
			this.getView().setModel(this.oModel);
			
			// set i18n model on view
         	var i18nModel = new ResourceModel({
            	bundleName: "ERPFrontendUI5.i18n.i18n",
            	supportedLocales: ["de", "en"],
            	fallbackLocale: "de"
         	});
         	this.getView().setModel(i18nModel, "i18n");
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